from rest_framework import serializers
from account.models import EmailVerificationToken


class verifyEmailSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    
    def validate_token(self, value):
        
        try:
            token_obj = EmailVerificationToken.objects.get(token=value)
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired token")
        
        if token_obj.is_expired():
            token_obj.delete()
            raise serializers.ValidationError("Token has expired")
        
        self.token_obj = token_obj
        return value