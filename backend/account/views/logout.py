import jwt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from account.utils.jwt_helper import decode_access_token
from account.models import UserSession
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator


@method_decorator(csrf_protect, name='dispatch')
class logoutView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh') # got token in string format

        if not refresh_token:
            return Response({
                'message': "Refresh token is required",
                'success': False,
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            payload = decode_access_token(refresh_token)
        except jwt.InvalidTokenError as e:
            return Response({
                'message': f'Invalid or expired token: {str(e)}',
                'success': False,
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        jti = payload['jti']
        
        UserSession.objects.filter(jti=jti).update(revoked=True)
        

        response = Response({
            'message': 'Logged out successfully',
            'success': True,
        }, status=status.HTTP_200_OK)
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        return response
    