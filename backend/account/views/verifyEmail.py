from rest_framework.views import APIView
from account.serializers.verifyEmail import verifyEmailSerializer
from rest_framework.response import Response
from rest_framework import status


class verifyEmail(APIView):
    def post(self, request):
        serializer = verifyEmailSerializer(data=request.data)
        print(serializer)
        if serializer.is_valid():
            token_obj = serializer.token_obj    # Get the token object from serializer
            token = serializer.validated_data['token']
            user = token_obj.user
            user.is_verified = True
            user.is_active = True
            user.save()
            token_obj.delete()
            
            return Response({
                "message": "User verified succesfully",
                "token": token,
                "success": True,
                "data": serializer.data,
                "email": user.email,
                "username": user.username,
                "status": status.HTTP_200_OK,
            }, status=status.HTTP_200_OK)
            
        return Response({
            "message" : "Email verification failed",
            "success": False,
            "errors": serializer.errors,
            "status": status.HTTP_400_BAD_REQUEST,
        }, status=status.HTTP_400_BAD_REQUEST)