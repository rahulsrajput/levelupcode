from dataclasses import fields
from rest_framework import serializers
from core.models import Problem, Submission, Tag, Language, SubmissionTestCase

class GetAllProblemSerializer(serializers.ModelSerializer):
    user_submission_passed = serializers.BooleanField()

    class Meta:
        model = Problem
        fields = ['id','title','difficulty','slug','tags','user_submission_passed']


    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['tags'] = [tag.slug for tag in instance.tags.all()]
        return data



class GetProblemSubmissionsForUserSerailizer(serializers.ModelSerializer):
    runtime = serializers.FloatField(read_only=True)
    memory = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Submission
        fields = ['id','problem', 'status', 'created_at', 'runtime', 'memory']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['problem'] = instance.problem.title
        data['language'] = instance.language.name
        data['slug'] = instance.problem.slug
        return data


class GetUserProblemSubmissionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['id', 'status', 'language', 'source_code', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['language'] = instance.language.name
        return data


class GetUserProblemSubmissionTestCasesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmissionTestCase
        exclude = ['token', 'submission']


class GetAllTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']



class GetAllLanguagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id','langId','name','isActive']