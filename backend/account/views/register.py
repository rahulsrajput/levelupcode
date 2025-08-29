from rest_framework.views import APIView
from account.serializers.register import RegisterSerializer
from rest_framework.response import Response
from rest_framework import status
from account.utils.email import sendgrid_template_mail
from account.constants import VERIFY_EMAIL_TEMPLATE_ID
import jwt
import datetime
from django.conf import settings


class registerView(APIView):
    def post(self, request):
        serialier = RegisterSerializer(data=request.data)
        if serialier.is_valid():
            user = serialier.save()
            
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
                key=settings.JWT_SECRET_KEY, 
                algorithm=settings.JWT_ALGORITHM
            )
            
            sendgrid_template_mail(
                to_email=user.email,
                template_id=VERIFY_EMAIL_TEMPLATE_ID,
                subject='Verify your email',
                dynamic_data={
                    "user_name": user.email or "User",
                    "verification_link": f"http://frontend/verify-email/{email_verification_token}"
                }
            )
            
            return Response({
                'message' : 'user registered successfully, please verify your email',
                'token' : email_verification_token,
                'email' : user.email,
                'username' : user.username,
                'user': serialier.data,
                'sucess': True,
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message' : 'user registration failed',
                'errors' : serialier.errors,
                'sucess': False,
            }, status=status.HTTP_400_BAD_REQUEST)