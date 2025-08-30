from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from account.serializers.resetPassword import ResetPasswordSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect


@method_decorator(csrf_protect, name='dispatch')
class ResetPassword(APIView):

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': "Password updated succesfully",
                'success': True
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message' : "Failed to update password",
            "success" : False,
            "serializer error" : serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)