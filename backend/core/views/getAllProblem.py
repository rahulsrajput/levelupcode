from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.utils.roleRequired import RoleRequired
from core.models import Problem, Submission, Tag
from django.db.models import OuterRef, Exists
from django.shortcuts import get_object_or_404 , get_list_or_404
from core.serializers.getAllProblem import (
    GetAllProblemSerializer, 
    GetProblemSubmissionsForUserSerailizer, 
    GetUserProblemSubmissionDetailSerializer, 
    GetAllTagsSerializer
)




"""
    View to get all problems with an additional field indicating if the logged-in user has a "passed" submission for each problem.

    How Subquery and annotate work here:
    - A subquery is defined to filter submissions based on the problem, user, and status.
        OuterRef - used to reference the outer query's fields (in this case, the Problem's primary key).
    - The main query annotates each Problem with a boolean field user_submission_passed.
    - The Exists function checks if the subquery returns any results for each problem.
        - if subquery returns results, user_submission_passed is True
"""

class GetAllProblemView(APIView):
    
    permission_classes = [IsAuthenticated]
   
    def get(self, request):
        
        # Define the subquery
        subquery = Submission.objects.filter(
            problem=OuterRef('pk'),   # links Problem to Submission
            user=request.user,        # filters submissions by logged-in user
            status="Passed"           # filters submissions where status is "passed"
        )
        
        problems = Problem.objects.annotate(
            user_submission_passed = Exists(subquery)
        ).order_by('-created_at')

        serializer = GetAllProblemSerializer(problems, many=True)
        
        return Response(
            {
                "message" : "all problem fetched successfully",
                "data" : serializer.data,
                "success" : True
            },
            status=status.HTTP_200_OK
        )
    


""" 
    View to get all submissions made by the logged-in user for a specific problem identified by its slug. Taking slug as input parameter.

    How Related (name) Manager works here:
        - The submissions related to a problem can be accessed using the related manager submissions.
        - This is done through the foreign key relationship defined in the Submission model.
        - it is checking problem pk present in Submission model's problem field.
"""

class GetUserProblemSubmissionsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        problem = get_object_or_404(Problem, slug=slug)

        try:
            submissions = problem.submissions.filter(user=request.user).order_by('created_at')
            
            serializer = GetProblemSubmissionsForUserSerailizer(submissions, many=True)

            return Response(
                {
                    "message" : "all submissions by user for problem fetched successfully",
                    "success" : True,
                    "data" : serializer.data
                },
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            
            return Response(
                {
                    "message" : "Error occured",
                    "success" : False,
                    "error" : str(e)
                }
            )



"""
    View to get the details of a specific submission made by the logged-in user for a specific problem identified by its slug and submission ID.
"""

class GetUserProblemSubmissionDetailView(APIView):

    permission_classes = [IsAuthenticated]
    
    def get(self, request, slug, id):

        submission = get_object_or_404(Submission, id=id)

        serializer = GetUserProblemSubmissionDetailSerializer(submission)

        return Response(
            {
                "message" : "submission fetched successfully",
                "success" : True,
                "data" : serializer.data
            },
            status=status.HTTP_200_OK
        )



""" 
    View to get all tags or problems associated with a specific tag identified by its slug.
"""

class GetTagProblemsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, slug=None):
        if not slug:
            tags = get_list_or_404(Tag)
            serializer = GetAllTagsSerializer(tags, many=True)
            return Response(
                {
                    "message" : "all tags fetched successfully",
                    "success" : True,
                    "data" : serializer.data
                },
                status=status.HTTP_200_OK
            )

        else:

            # Define the subquery
            subquery = Submission.objects.filter(
                problem=OuterRef('pk'),   # links Problem to Submission
                user=request.user,        # filters submissions by logged-in user
                status="Passed"           # filters submissions where status is "passed"
            )
        
            problems = Problem.objects.annotate(
                user_submission_passed = Exists(subquery)
            ).filter(tags__name=slug).order_by('-created_at')

            serializer = GetAllProblemSerializer(problems, many=True)

            return Response(
                {
                    "message" : "Problems for the tag fetched successfully",
                    "success" : True,
                    "data" : serializer.data
                },
                status=status.HTTP_200_OK
            )