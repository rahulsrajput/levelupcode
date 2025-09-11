from rest_framework import serializers
from core.models import Problem, Tag


class CreateProblemSerializer(serializers.ModelSerializer):

    """ 
        why need to define tags as a list of strings?
        because in the Problem model, tags is a ManyToManyField to Tag model.
        so when creating a Problem instance, we need to provide a list of tag names.
        we define tags as a ListField of CharField to accept a list of strings in the input.
        then in the create method, we handle the creation of Tag instances and
        associate them with the Problem instance.
        this field is write_only because we don't want to include it in the serialized output.
        in the to_representation method, we convert the tags to a list of tag names for output.
    """

    tags = serializers.ListField(
        child=serializers.CharField(), write_only=True
    )


    class Meta: # Meta class to specify model and fields

        model = Problem # the Problem model from core/models.py

        fields = "__all__"  # all the fields from the Problem model

        read_only_fields = ['id', 'createdAt', 'updatedAt', 'user']

    
    def create(self, validated_data):

        tags_data = validated_data.pop('tags', [])

        problem = Problem.objects.create(**validated_data) # ** unpacking all validated fields for creation
        
        for tag_name in tags_data:
            
            tag, created = Tag.objects.get_or_create(name=tag_name)
            problem.tags.add(tag)

        return problem
    
    
    """ 
        to_representation method to customize the output representation of the Problem instance.
        converting tags to a list of tag names for output. by default, it would return a list of tag IDs.
        also converting user to email for better readability.
        this method is called when serializing the instance to JSON for API responses.
        like when calling serializer.data or returning the serializer in a Response.
    """
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        representation['tags'] = [tag.name for tag in instance.tags.all()]
        
        representation['user'] = instance.user.email
       
        return representation
    