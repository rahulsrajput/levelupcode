from rest_framework import serializers
from core.models import Problem, Submission, Tag

class GetAllProblemSerializer(serializers.ModelSerializer):
    user_submission_passed = serializers.BooleanField()

    class Meta:
        model = Problem
        fields = ['id','title','difficulty','slug','tags','user_submission_passed']


    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['tags'] = [tag.name for tag in instance.tags.all()]
        return data



class GetProblemSubmissionsForUserSerailizer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['id','problem', 'status']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['problem'] = instance.problem.title
        data['language'] = instance.language.name
        data['slug'] = instance.problem.slug
        return data


class GetUserProblemSubmissionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['id', 'status', 'language', 'source_code']


class GetAllTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']