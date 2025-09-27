from rest_framework import serializers
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer) :
   
    password = serializers.CharField(write_only=True, min_length=8)

    """ 
        Meta class to specify model and fields for the serializer
        Model - specify the model to be used for the serializer
        Fields - spcify the fields to be included in the serializer or which are required for user registration
        Extra kwargs - to make some fields optional
    """

    class Meta:
        model = User
        
        fields = ['email','password','first_name','last_name','profile_url','bio','role','is_verified','is_active','is_staff','is_superuser', 'profile_url']
        
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
            'profile_url': {'required': False},
        }

    def create(self, validated_data):

        """ 
            Create a new user instance with the validated data
            Set is_active to False by default
            Generate a unique alphanumeric username using uuid
            Return the created user instance
        """
        
        username = f"user_{uuid.uuid4().hex[:3]}" # alphanumeric username
       
        user = User.objects.create_user(
            username=username,
            email = self.validated_data['email'],
            password = self.validated_data['password'],
            is_active = True
        )
        
        return user