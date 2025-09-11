from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from account.models import PasswordResetToken
from account.utils.email import send_mailtrap_mail
from account.constants import RESET_PASSWORD_TEMPLATE_ID
from django.contrib.auth import get_user_model
from decouple import config

User = get_user_model()


class ForgotPassword(APIView):

    def post(self, request):
        # print(request.data)
        try:
            user = User.objects.get(email=request.data.get("email"))
            resetToken = PasswordResetToken.objects.create(user=user)
            verification_link = f"{config('FRONTEND_URL')}/verify-email/{resetToken.token}"
            # print(resetToken)
    
            try:
                response = send_mailtrap_mail(
                    to_email = user.email,
                    user_name = user.email,
                    link = verification_link,
                    template_id = RESET_PASSWORD_TEMPLATE_ID,
                )
                
                if response.status_code == 200:
                    return Response({
                        'message': "Reset password link sent via email",
                        'success': True
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'message': "Failed to send email",
                        'mailtrap_error' : response.text,
                        'success': False
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            except Exception as e:
                return Response({
                    'message':f"Error occured while sending reset password link , {str(e)}",
                    'success': False
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

        except User.DoesNotExist:  
            return Response({
                'message': "User email does'nt exists",
                'success': False
            }, status=status.HTTP_404_NOT_FOUND)