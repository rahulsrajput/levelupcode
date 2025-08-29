from rest_framework import serializers
from account.utils.jwt_helper import decode_access_token
from account.models import CustomUser

class verifyEmailSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate_token(self, token):
        try:
            payload = decode_access_token(token)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        
        if payload['type'] != 'email_verification_token':
            raise serializers.ValidationError("Invalid token type")
        
        try:
            self.user = CustomUser.objects.get(id=payload['user_id'])
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found")
        
        return payload
    
    def save(self, **kwargs):
        self.user.is_verified = True
        self.user.is_active = True
        self.user.save()
        return self.user