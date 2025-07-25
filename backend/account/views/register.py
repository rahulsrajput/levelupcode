from rest_framework.views import APIView
from account.serializers.register import RegisterSerializer
from account.models import EmailVerificationToken
from rest_framework.response import Response
from rest_framework import status
from account.utils.email import sendgrid_template_mail
from account.constants import VERIFY_EMAIL_TEMPLATE_ID



class registerView(APIView):
    def post(self, request):
        serialier = RegisterSerializer(data=request.data)
        if serialier.is_valid():
            user = serialier.save()
            
            token = EmailVerificationToken.objects.create(user=user)
            
            sendgrid_template_mail(
                to_email=user.email,
                template_id=VERIFY_EMAIL_TEMPLATE_ID,
                subject='Verify your email',
                dynamic_data={
                    "user_name": user.email or "User",
                    "verification_link": f"http://localhost:3000/verify-email/{token.token}"
                }
            )
            
            return Response({
                'message' : 'user registered successfully, please verify your email',
                'token' : token.token,
                'email' : user.email,
                'username' : user.username,
                'user': serialier.data,
                'sucess': True,
                'status': status.HTTP_201_CREATED
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message' : 'user registration failed',
                'errors' : serialier.errors,
                'sucess': False,
                'status': status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)
            
            
