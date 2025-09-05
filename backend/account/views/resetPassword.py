from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from account.serializers.resetPassword import ResetPasswordSerializer


class ResetPassword(APIView):
    
    """
        Reset user password using a valid reset token.
        Expects a JSON payload with 'token' and 'password'.
        Returns success or error message.
    """

    def post(self, request):
        
        serializer = ResetPasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            
            serializer.save()
            
            return Response(
                {
                    'message': "password updated succesfully",
                    'success': True
                }, 
                status=status.HTTP_200_OK
            )
        
        return Response(
            {
                'message' : "failed to update password",
                "success" : False,
                "serializer_error" : serializer.errors
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )