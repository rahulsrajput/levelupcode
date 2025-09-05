from rest_framework import serializers
from django.contrib.auth import get_user_model
User = get_user_model()

class ProfileSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = [
            'email',
            'username',
            'first_name',
            'last_name',
            'bio',
            'created_at',
            'role',
            'profile_url'
        ]
        read_only_fields = [
            'created_at',
            'role',
            'username',
        ]

        def update(self, instance, validated_data):

            """
                Update the user instance with the validated data and save it.
                If data is not provided for a field, it will not be updated and existing value will be retained.
                Returns the updated user instance.
            """
            
            instance.email = validated_data.get('email', instance.email)
            instance.first_name = validated_data.get('first_name', instance.first_name)
            instance.last_name = validated_data.get('last_name', instance.last_name)
            instance.bio = validated_data.get('bio', instance.bio)
            instance.profile_url = validated_data.get('profile_url', instance.profile_url)
            instance.save()
            
            return instance