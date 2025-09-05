from functools import partial
from rest_framework.views import APIView
from account.serializers.register import RegisterSerializer
from rest_framework.response import Response
from rest_framework import status
from account.utils.email import send_mailtrap_mail
from account.constants import VERIFY_EMAIL_TEMPLATE_ID
import jwt
import datetime
from django.conf import settings
from decouple import config



class registerView(APIView):
    
    """
        API View to handle user registration.
        Accepts POST requests with user data, validates and creates a new user.
        Sends a verification email upon successful registration.
        Returns appropriate success or error responses.
        The .data attribute of the serializer returns a JSON-ready representation 
        of the serializer fields (or Meta.model fields if using a ModelSerializer).
    """

    def post(self, request):
    
        serializer = RegisterSerializer(data=request.data)
    
        if serializer.is_valid():
            
            user = serializer.save()
            
            payload = {
                'user_id' : user.id,
                'email' : user.email,
                'role' : user.role,
                'type' : 'email_verification_token',
                'exp' : datetime.datetime.utcnow() + datetime.timedelta(minutes=5),
                'iat' : datetime.datetime.utcnow()
            }
            
            email_verification_token = jwt.encode(
                payload, 
                key = settings.JWT_SECRET_KEY, 
                algorithm = settings.JWT_ALGORITHM
            )
            
            try:
                
                response = send_mailtrap_mail(
                    to_email = user.email,
                    user_name = user.email,
                    link = f'{config("FRONTEND_URL")}/verify-email/{email_verification_token}',
                    template_id = VERIFY_EMAIL_TEMPLATE_ID,
                )

                if response.status_code != 200:
                    
                    raise Exception(f"Mailtrap error: {response.text}")
            
            except Exception as e:
                
                return Response(
                    {
                        'message' : 'user registered but failed to send verification email',
                        'mailtrap_error' : str(e),
                        'success': False,
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
            return Response(
                {
                    'message' : 'user registered successfully, please verify your email',
                    # 'token' : email_verification_token,
                    'user': serializer.data,
                    'success': True,
                }, 
                status=status.HTTP_201_CREATED
            )
        
        else:
            
            return Response(
                {
                    'message' : 'user registration failed',
                    'serializer_errors' : serializer.errors,
                    'sucess': False,
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )