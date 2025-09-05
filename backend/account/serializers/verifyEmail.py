from rest_framework import serializers
from account.utils.jwt_helper import decode_token
from django.contrib.auth import get_user_model

User = get_user_model()

class verifyEmailSerializer(serializers.Serializer):
    
    """ 
        validation and deserialization of email verification token
        deserialize mean to convert the token to a python object
    """

    token = serializers.CharField()
    
    def validate_token(self, token):
        """ 
            Field level validation for token
            Validate the token and return the payload if valid
            Otherwise raise a validation error
            Also set the user attribute if token is valid
            The token should be of type 'email_verification_token'
            and the user should exist
            The 'user' is set to self.user for use in save method
            Return the payload if everything is valid
            Payload contains 'user_id', 'email', 'role', 'type', 'exp', 'iat'
        """
        
        try:
            
            payload = decode_token(token)
        
        except Exception as e:
            
            raise serializers.ValidationError(str(e))
        
        if payload.get('type') != 'email_verification_token':
            
            raise serializers.ValidationError("invalid token type")
        
        try:
            self.user = User.objects.get(
                id=payload.get('user_id'),
            )
        
        except User.DoesNotExist:
            
            raise serializers.ValidationError("user not found")
        
        return payload
    
    def save(self, **kwargs):
        
        self.user.is_verified = True
        
        self.user.is_active = True
        
        self.user.save()
        
        return self.user