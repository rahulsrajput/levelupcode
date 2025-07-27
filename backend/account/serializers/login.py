from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from account.utils.logUserSession import log_user_session


class LoginUserSerialier(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError("Email and password both required")
        
        user = authenticate(email=email, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        
        if not user.is_active:
            raise serializers.ValidationError("account is not active")
        
        if not user.is_verified:
            raise serializers.ValidationError("email is not verified")
        
        
        # issue token
        refresh = RefreshToken.for_user(user=user)
        access = refresh.access_token
        
        # log session
        request = self.context.get('request')
        log_user_session(user=user, refresh_token=refresh, request=request)
        
        attrs['refresh'] = str(refresh)
        attrs['access'] = str(access)
        attrs['user'] = user
        return attrs
        
        