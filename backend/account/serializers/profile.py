from rest_framework import serializers
from account.models import CustomUser

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
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
            'profile_url',
            'username',
        ]

        def update(self, instance, validated_data):
            instance.email = validated_data.get('email', instance.email)
            instance.first_name = validated_data.get('first_name', instance.first_name)
            instance.last_name = validated_data.get('last_name', instance.last_name)
            instance.bio = validated_data.get('bio', instance.bio)
            instance.save()
            return instance