from datetime import datetime, timezone
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.db import transaction
from account.models import UserSession
from account.utils.jwt_helper import generate_access_token, generate_refresh_token, decode_token
from django.conf import settings


class RefreshView(APIView):

    """ 
        View to handle token refresh using refresh token from HttpOnly cookie.
        Implements refresh token rotation and user log session management for revoking tokens.
        Using @transaction.atomic to ensure DB integrity during token rotation.
            what is integrity ?
            - Integrity in the context of databases refers to the accuracy and consistency of data over its entire lifecycle.
            why to use it ?
            - Using @transaction.atomic ensures that all database operations within the block are treated as a single transaction.
            - If any operation fails, the entire transaction is rolled back, maintaining data integrity.
        Steps:
        1. Extract refresh token from HttpOnly cookie.
        2. Decode and validate the refresh token.
        3. Lock the user session row in DB to prevent concurrent updates.
        4. Validate session state (not revoked, not replaced, token matches, not expired).
        5. Generate new access and refresh tokens.
        6. Update old session as revoked and link to new session.
        7. Create new user session with new refresh token.
        8. Set new tokens in HttpOnly cookies in response.
        9. Return new access and refresh tokens in response body.
        Error handling for missing, invalid, expired, or reused tokens.
        Security:
        - HttpOnly cookies to prevent XSS access.
        - Token rotation to limit the lifespan of refresh tokens.
        - Session management to allow revocation of tokens.
    """
    
    @transaction.atomic
    def post(self, request):
        
        refresh_token = request.COOKIES.get('refresh')
        
        if not refresh_token:
            
            return Response(
                {
                    'message': 'Refresh token is missing',
                    'success': False,
                }, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            
            payload = decode_token(refresh_token)
            
            user_id = payload['user_id']
            jti = payload['jti']
            exp_timestamp = payload['exp']
            exp = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)


            """ Lock the row in DB for update → prevents double refresh"""  
            try:
            
                user_session = UserSession.objects.select_for_update().get(jti=jti)
            
            except UserSession.DoesNotExist:
                
                return Response(
                    {
                        'message': 'Session not found for this token',
                        'success': False,
                    }, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
                

            """ Validate user session state """
            if user_session.revoked:
            
                return Response({
                    'message': 'Refresh token has been revoked',
                    'success': False,
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if user_session.replaced_by:
            
                return Response({
                    'message': 'Refresh token already been rotated (reuse attempt)',
                    'success': False,
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if user_session.refresh_token != refresh_token:
            
                return Response({
                    'message': 'Refresh token does not match the stored refresh token in session',
                    'success': False,
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if exp < datetime.now(tz=timezone.utc):
            
                return Response({
                    'message': 'Refresh token has expired',
                    'success': False,
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if user_session.user_id != user_id:
            
                return Response({
                    'message': 'Token user mismatch',
                    'success': False,
                }, status=status.HTTP_401_UNAUTHORIZED)


            """ Generate new tokens """
            new_access_token = generate_access_token(user_session.user)
            new_refresh_token, new_jti = generate_refresh_token(user_session.user)

            """ Update user old session """
            user_session.revoked = True
            user_session.replaced_by = new_jti
            user_session.save()
            
            """ Create new user session """
            new_session = UserSession(
                user = user_session.user,
                refresh_token = new_refresh_token,
                ip_address = user_session.ip_address,
                user_agent = user_session.user_agent,
                jti = new_jti
            )
            new_session.save()

            response = Response(
                {
                    'message': 'Token refreshed successfully',
                    'access': new_access_token,
                    'refresh': new_refresh_token,
                    'success': True,
                }, 
                status=status.HTTP_200_OK
            )

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
            return Response(
                {
                    'message': f'Error processing refresh token: {str(e)}',
                    'success': False,
                }, 
                status=status.HTTP_401_UNAUTHORIZED
            )