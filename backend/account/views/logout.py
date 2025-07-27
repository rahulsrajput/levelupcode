from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from account.models import UserSession
from rest_framework_simplejwt.exceptions import TokenError as JWTTokenError


class logoutView(APIView):
    def post(self, request):
        refresh_token = request.data.get('refresh_token') # got token in string format

        if not refresh_token:
            return Response({
                'message': "Refresh token is required",
                'success': False,
                'status': status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = RefreshToken(token=refresh_token) # gives refresh_token object from string format
            token.blacklist() # invalidates refresh token 

            # Removing refresh token from userSession collection/table
            UserSession.objects.filter(refresh_token=refresh_token).delete()

            return Response({
                'message' : "Succesfully logout",
                'success': True,
                'data': token.payload,
                'status': status.HTTP_200_OK
            }, status=status.HTTP_200_OK)

        
        except JWTTokenError as e:
            return Response({
                'message': "Invalid or expired refresh token",
                'success': False,
                'status': status.HTTP_401_UNAUTHORIZED,
                'jwt_errors': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)
