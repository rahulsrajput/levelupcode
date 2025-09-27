from django.conf import settings
from account.serializers.login import LoginUserSerialier
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


class loginView(APIView):
    
    def post(self, request):
    
        serializer = LoginUserSerialier(data=request.data, context={'request':request})
        # print(serializer)
        
        if serializer.is_valid():
    
            # print(serializer.validated_data)
            # print(serializer.data)
    
            response = Response(
                {
                    "message": "Login succesfully",
                    "success": True,
                    "email": serializer.validated_data.get("email"),
                    "refresh": serializer.validated_data.get("refresh"),
                    "access": serializer.validated_data.get("access"),
                    "user": serializer.validated_data.get("user"),
                }, 
                status=status.HTTP_200_OK
            )

            # Set the cookies in the response
            response.set_cookie(
                key="refresh",
                value=serializer.validated_data.get("refresh"),
                httponly=True, # cookie will not be accessible by javascript
                samesite="None",
                secure=True, # cookie will only be sent over https
                max_age=settings.COOKIE_MAX_AGE.get("refresh") # 7 days
            )
            response.set_cookie(
                key="access",
                value=serializer.validated_data.get("access"),
                httponly=True, # cookie will not be accessible by javascript
                samesite="None",
                secure=True, # cookie will only be sent over https
                max_age=settings.COOKIE_MAX_AGE.get("access") # 5 minutes
            )
            return response
        
        
        return Response(
            {
                "message":"Login failed",
                "success": False,
                "errors": serializer.errors,
            },
            status=status.HTTP_401_UNAUTHORIZED
        )
            