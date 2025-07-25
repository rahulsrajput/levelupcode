from rest_framework import serializers
from account.models import CustomUser
import uuid
from account.models import CustomUser
from django.contrib.auth import authenticate

class RegisterSerializer(serializers.ModelSerializer) :
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = ['email','password','first_name','last_name','profile_url','bio','role','is_verified','is_active','is_staff','is_superuser']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'profile_url': {'required': False},
            'bio': {'required': False},
            'role': {'required': False},
            'is_verified': {'required': False},
            'is_active': {'required': False},
            'is_staff': {'required': False},
            'is_superuser': {'required': False},
        }

    def create(self, validated_data):
        username = f"user_{uuid.uuid4().hex[:3]}" # alphanumeric username
       
        user = CustomUser.objects.create_user(
            username=username,
            email = self.validated_data['email'],
            password = self.validated_data['password'],
            is_active = False
        )
        return user