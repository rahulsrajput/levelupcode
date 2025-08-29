from functools import partial
from rest_framework.response import Response
from rest_framework.views import APIView
from account.serializers.profile import ProfileSerializer
from account.models import CustomUser
from rest_framework import status

class ProfileView(APIView):

    def get(self, request):
        try:
            # print(request.user_id)
            user = CustomUser.objects.get(id=request.user_id)
            serializer = ProfileSerializer(instance=user)
            
            # print(serializer.data)

            return Response({
                "message":"Profile data",
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        
        except CustomUser.DoesNotExist:
            return Response({
                "message": "User not found",
                'success': False
            }, status=status.HTTP_404_NOT_FOUND)

    
    def patch(self, request):
        try:
            user = CustomUser.objects.get(id=request.user_id)
            serializer = ProfileSerializer(instance=user, data=request.data, partial=True)
            print(serializer.initial_data)
            if serializer.is_valid():
                serializer.save()

                # print(serializer.data)
                # print(serializer.validated_data)
                # print(serializer.instance)

                return Response({
                    "message" : "Profile updated successfully",
                    'success': True,
                    'updated_data' : serializer.data
                }, status=status.HTTP_200_OK)
            
        except CustomUser.DoesNotExist:
            return Response({
                "message": "User not found",
                'success': False
            }, status=status.HTTP_404_NOT_FOUND)