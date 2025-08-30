from rest_framework.views import APIView
from account.serializers.verifyEmail import verifyEmailSerializer
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect


@method_decorator(csrf_protect, name='dispatch')
class verifyEmail(APIView):
    def post(self, request):
        serializer = verifyEmailSerializer(data=request.data)
        if serializer.is_valid():
            payload = serializer.validated_data.get('token')
            # print(payload)
            
            user = serializer.save()
            
            return Response({
                'message': "Email verified successfully",
                'data' : f'User Object: {str(user)}',
                'success': True
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': "Email verification failed",
            'success': False,
            'serializer_errors': serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)
    
