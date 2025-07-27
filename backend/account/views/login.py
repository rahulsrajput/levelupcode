from account.serializers.login import LoginUserSerialier
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


class loginView(APIView):
    def post(self, request):
        serializer = LoginUserSerialier(data=request.data, context={'request':request})
        print(serializer)
        
        if serializer.is_valid():
            # print(serializer.validated_data)
            
            return Response({
                "message": "Login succesfully",
                "success": True,
                "email": serializer.validated_data.get("email"),
                "username": serializer.validated_data.get("user").username,
                "refresh": serializer.validated_data.get("refresh"),
                "access": serializer.validated_data.get("access"),
                "status": status.HTTP_200_OK
            }, status=status.HTTP_200_OK)
        
        
        return Response({
            "message":"Login failed",
            "success": False,
            "errors": serializer.errors,
            "status": status.HTTP_400_BAD_REQUEST
        },status=status.HTTP_400_BAD_REQUEST)
            