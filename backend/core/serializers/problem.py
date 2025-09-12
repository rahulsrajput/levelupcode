from os import read
from rest_framework import serializers
from core.models import Problem, Tag


"""
    Serializer for retrieving Problem instances with custom representation.

    This serializer returns all fields of the Problem model and overrides
    the `to_representation` method to:
      - Represent the related tags as a list of tag names instead of tag objects.
      - Represent the user as the user's email instead of the user object.

    Returns:
        dict: Serialized representation of the Problem instance with
              customized 'tags' and 'user' fields.
"""

class GetProblemSerializer(serializers.ModelSerializer):
    
    class Meta:
        
        model = Problem
        
        fields = '__all__' 

    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        representation['tags'] = [tag.name for tag in instance.tags.all()]
        
        representation['user'] = instance.user.email
       
        return representation
    



"""
    Serializer for partially updating Problem instances with custom tag handling.

    This serializer allows updating any field of the Problem model except for
    read-only fields. It accepts a list of tag names for the 'tags' field and
    ensures the Problem's tags are updated accordingly. The `to_representation`
    method customizes the output to:
      - Represent tags as a list of tag names.
      - Represent the user as the user's email.

    Methods:
        update(instance, validated_data): Handles partial updates, including tag management.
        to_representation(instance): Customizes the serialized output for tags and user.

    Returns:
        dict: Serialized representation of the Problem instance with
              customized 'tags' and 'user' fields.
    """

class PatchProblemSerializer(serializers.ModelSerializer):
    
    tags = serializers.ListField(
        child=serializers.CharField(), required=False, write_only=True
    )
    
    class Meta:
        model = Problem
        fields = '__all__'
        read_only_fields = ['id', 'createdAt', 'updatedAt', 'user']
        extra_kwargs = {
            'slug' : {'required': False},
        }

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)

        if 'title' in validated_data:
            instance.title = validated_data.get('title')
        
        if 'description' in validated_data:
            instance.description = validated_data.get('description')
        
        if 'difficulty' in validated_data:
            instance.difficulty = validated_data.get('difficulty')
        
        if 'examples' in validated_data:
            instance.examples = validated_data.get('examples')
        
        if 'constraints' in validated_data:
            instance.constraints = validated_data.get('constraints')
        
        if 'hints' in validated_data:
            instance.hints = validated_data.get('hints')
        
        if 'editorial' in validated_data:
            instance.editorial = validated_data.get('editorial')
        
        if 'testcases' in validated_data:
            instance.testcases = validated_data.get('testcases')
        
        if 'code_snippets' in validated_data:
            instance.code_snippets = validated_data.get('code_snippets')
        
        if 'reference_solutions' in validated_data:
            instance.reference_solutions = validated_data.get('reference_solutions')
        
        instance.save()

        if tags_data is not None:
            instance.tags.clear()
            for tag_name in tags_data:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                instance.tags.add(tag)

        return instance
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['tags'] = [tag.name for tag in instance.tags.all()]
        representation['user'] = instance.user.email
        return representation