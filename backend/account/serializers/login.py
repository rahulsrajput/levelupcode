from rest_framework import serializers
from django.contrib.auth import authenticate
from account.utils.logUserSession import log_user_session
from account.utils.jwt_helper import generate_access_token, generate_refresh_token

class LoginUserSerialier(serializers.Serializer):
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError("email and password both required")
        
        user = authenticate(email=email, password=password)
        
        if not user:
            raise serializers.ValidationError("invalid credentials")
        
        if not user.is_active:
            raise serializers.ValidationError("account is not active")
        
        if not user.is_verified:
            raise serializers.ValidationError("email is not verified")
        
        
        # issue token
        refresh, jti = generate_refresh_token(user=user)
        access = generate_access_token(user=user)
        
        # log session
        request = self.context.get('request')
        log_user_session(user=user, refresh_token=refresh, jti=jti, request=request)
        
        attrs['refresh'] = str(refresh)
        attrs['access'] = str(access)
        attrs['user'] = user
        return attrs