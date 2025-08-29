from rest_framework import serializers
from account.models import PasswordResetToken

class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    password = serializers.CharField(write_only=True, min_length=8)
    
    def validate_token(self, token):
        try:
            reset_token = PasswordResetToken.objects.get(token=token, used=False)
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid or already used token")
        
        if reset_token.is_expired():
            reset_token.expired = True
            reset_token.save()
            raise serializers.ValidationError("Token has expired")
        
        self.reset_token = reset_token
        return token
        

    def save(self, **kwargs):
        reset_token = self.reset_token # comes from validate_token()
        password = self.validated_data['password']
        
        # mark token used
        reset_token.used = True
        reset_token.save()

        # update user password
        user = reset_token.user
        user.set_password(password)
        user.save()
        return user