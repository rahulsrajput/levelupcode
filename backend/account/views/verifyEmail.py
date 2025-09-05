from rest_framework.views import APIView
from account.serializers.verifyEmail import verifyEmailSerializer
from rest_framework.response import Response
from rest_framework import status


class verifyEmail(APIView):

    """ 
        verifyEmail API View - Verifies a user's email using a token.
        Expects a POST request with a 'token' in the request data.
        Returns a success message if the email is verified, otherwise returns an error message.
        ---    
    """
    
    def post(self, request):
        
        serializer = verifyEmailSerializer(data=request.data)

        """ 
            .isValid() - Validates the serializer fields based on the defined rules and field level validations in the serializer class.
            .validated_data - Accesses the validated data from the serializer.
            .save() - Saves the serializer data by calling the create or update method.
            .errors - Accesses the errors in the serializer if validation fails or raises an exception.
        """
        
        if serializer.is_valid():
            
            payload = serializer.validated_data.get('token')
            # print(payload)
            
            user = serializer.save()
            
            return Response(
                {
                    'message': "email verified successfully",
                    'success': True
                }, 
                status=status.HTTP_200_OK
            )
        
        return Response(
            {
                'message': "Email verification failed",
                'success': False,
                'serializer_errors': serializer.errors,
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
