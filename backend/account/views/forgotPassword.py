from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from account.models import CustomUser, PasswordResetToken
from account.utils.email import sendgrid_template_mail
from account import constants


class ForgotPassword(APIView):

    def post(self, request):
        # print(request.data)
        try:
            user = CustomUser.objects.get(email=request.data.get("email"))
            resetToken = PasswordResetToken.objects.create(user=user)
            # print(resetToken)
    
            try:
                sendgrid_template_mail(
                    to_email=user.email,
                    template_id=constants.RESET_PASSWORD_TEMPLATE_ID,
                    subject="Password reset link",
                    dynamic_data={
                        "user_name": user.email or "User",
                        "verification_link": f"http://frontend/reset-password/{resetToken.token}"
                    }
                )

                return Response({
                    'message': "Reset Password link is shared on email",
                    'success': True
                }, status=status.HTTP_200_OK)
        
            except Exception as e:
                return Response({
                    'message':f"Error occured while sending reset password link , {str(e)}",
                    'success': False
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

        except CustomUser.DoesNotExist:  
            return Response({
                'message': "User email does'nt exists",
                'success': False
            }, status=status.HTTP_401_UNAUTHORIZED)