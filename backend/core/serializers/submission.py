from rest_framework import serializers
from core.models import Submission

class SubmitProblemSerializer(serializers.ModelSerializer):
    
    language = serializers.CharField()
    source_code = serializers.CharField()
    problem = serializers.SlugField()

    class Meta:
        model = Submission
        fields = ['problem','source_code', 'language']