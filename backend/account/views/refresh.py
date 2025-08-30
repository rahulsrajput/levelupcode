from datetime import datetime, timezone
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.db import transaction
from account.models import UserSession
from account.utils.jwt_helper import generate_access_token, generate_refresh_token, decode_access_token
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect


@method_decorator(csrf_protect, name='dispatch')
class RefreshView(APIView):
    
    @transaction.atomic
    def post(self, request):
        
        refresh_token = request.COOKIES.get('refresh')
        if not refresh_token:
            return Response({
                'message': 'Refresh token is missing',
                'success': False,
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = decode_access_token(refresh_token)
            
            user_id = payload['user_id']
            jti = payload['jti']
            exp_timestamp = payload['exp']
            exp = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)


            """ Lock the row in DB for update → prevents double refresh"""  
            try:
                user_sessoion = UserSession.objects.select_for_update().get(jti=jti)
            except UserSession.DoesNotExist:
                return Response({
                    'message': 'Session not found for this token',
                    'success': False,
                }, status=status.HTTP_401_UNAUTHORIZED)
                

            """ Validate user session state """
            if user_sessoion.revoked:
                return Response({
                    'message': 'Refresh token has been revoked',
                    'success': False,
                }, status=status.HTTP_401_UNAUTHORIZED)
            if user_sessoion.replaced_by:
                return Response({
                    'message': 'Refresh token already been rotated (reuse attempt)',
                    'success': False,
                }, status=status.HTTP_401_UNAUTHORIZED)
            if user_sessoion.refresh_token != refresh_token:
                return Response({
                    'message': 'Refresh token does not match the stored refresh token in session',
                    'success': False,
                }, status=status.HTTP_401_UNAUTHORIZED)
            if exp < datetime.now(tz=timezone.utc):
                return Response({
                    'message': 'Refresh token has expired',
                    'success': False,
                }, status=status.HTTP_401_UNAUTHORIZED)
            if user_sessoion.user_id != user_id:
                return Response({
                    'message': 'Token user mismatch',
                    'success': False,
                }, status=status.HTTP_401_UNAUTHORIZED)


            """ Generate new tokens """
            new_access_token = generate_access_token(user_sessoion.user)
            new_refresh_token, new_jti = generate_refresh_token(user_sessoion.user)

            """ Update user old session """
            user_sessoion.revoked = True
            user_sessoion.replaced_by = new_jti
            user_sessoion.save()
            
            """ Create new user session """
            new_session = UserSession(
                user = user_sessoion.user,
                refresh_token = new_refresh_token,
                ip_address = user_sessoion.ip_address,
                user_agent = user_sessoion.user_agent,
                jti = new_jti
            )
            new_session.save()

            response = Response({
                'message': 'Token refreshed successfully',
                'access': new_access_token,
                'refresh': new_refresh_token,
                'success': True,
            }, status=status.HTTP_200_OK)

            def set_cookie():
                response.set_cookie(
                    key='access',
                    value=new_access_token,
                    httponly=True,
                    secure=True,
                    samesite='None',
                    max_age=settings.COOKIE_MAX_AGE.get("access") # 5 min
                )
                response.set_cookie(
                    key='refresh',
                    value=new_refresh_token,
                    httponly=True,
                    secure=True,
                    samesite='None',
                    max_age=settings.COOKIE_MAX_AGE.get("refresh") # 7 days
                )

            transaction.on_commit(set_cookie)
            return response


        except Exception as e:
            return Response({
                'message': f'Error processing refresh token: {str(e)}',
                'success': False,
            }, status=status.HTTP_401_UNAUTHORIZED)