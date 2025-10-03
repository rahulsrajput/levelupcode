from django.db.models import Q
from django.forms import FloatField
from django.utils.dateparse import parse_datetime
from django.db.models import Max, FloatField
from django.db.models.functions import Cast
from django.utils.timezone import make_aware
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
    GetAllTagsSerializer,
    GetAllLanguagesSerializer,
    GetUserProblemSubmissionTestCasesSerializer
)
from core.models import Language




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
        try:
            limit = int(request.GET.get('limit', 10))  # how many items per batch 
            cursor_date = request.GET.get('cursor_date')  # cursor for pagination
            cursor_id = request.GET.get('cursor_id')  # cursor for pagination
            
            
            # Convert cursor_date from string to datetime
            if cursor_date:
                # Replace spaces with + to handle unencoded URLs
                cursor_date = cursor_date.replace(' ', '+')
                dt = parse_datetime(cursor_date)
                if dt is None:
                    return Response({"error": "Invalid cursor_date"}, status=400)
                cursor_date = dt
            
            
            if cursor_id:
                try:
                    cursor_id = int(cursor_id)
                except ValueError:
                    return Response({"error": "Invalid cursor_id"}, status=400)


            # Define the subquery
            subquery = Submission.objects.filter(
                problem=OuterRef('pk'),   # links Problem to Submission
                user=request.user,        # filters submissions by logged-in user
                status="Passed"           # filters submissions where status is "passed"
            )
            

            problems = Problem.objects.annotate(
                user_submission_passed = Exists(subquery)
            ).order_by('-created_at', '-id')


            # Apply cursor (fetch only items after given cursor)
            if cursor_date and cursor_id:
                problems = problems.filter(
                    Q(created_at__lt=cursor_date) |
                    Q(created_at=cursor_date, id__lt=cursor_id)
                )

            
            # Fetch one extra to check if more items exist
            problems = list(problems[:limit])
            has_more = len(problems) == limit


            if not problems:
                return Response({
                    "message": "No more problems",
                    "success": True,
                    "data": [],
                    "next_cursor_date": None,
                    "next_cursor_id": None,
                    "has_more": False
                }, status=status.HTTP_200_OK)


            serializer = GetAllProblemSerializer(problems, many=True)


            # Set next cursor
            last_problem = problems[-1]
            next_cursor_date = last_problem.created_at.isoformat()
            next_cursor_id = last_problem.id
            
            return Response(
                {
                    "message": "Problems fetched successfully",
                    "success": True,
                    "data": serializer.data,
                    "next_cursor_date": next_cursor_date,
                    "next_cursor_id": next_cursor_id,
                    "has_more": has_more
                },
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {
                    "message" : "Error occured",
                    "success" : False,
                    "error" : str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    


""" 
    View to get all submissions made by the logged-in user for a specific problem identified by its slug. Taking slug as input parameter.

    How Related (name) Manager works here:
        - The submissions related to a problem can be accessed using the related manager submissions.
        - This is done through the foreign key relationship defined in the Submission model.
        - it is checking problem pk present in Submission model's problem field.
    
        
    Annotate each Submission with runtime and memory values.

    - `testcases__time` / `testcases__memory`:
        Follows the reverse FK (Submission → SubmissionTestCase)
        and gathers all `time` / `memory` values for that submission.

    - `Cast(..., FloatField())`:
        Converts CharField values (stored as strings in DB) into floats
        so numeric aggregation can be applied.

    - `Max(...)`:
        Picks the **largest value** among all testcases for each submission.
        (runtime = slowest testcase, memory = highest usage testcase)

    - `.annotate(runtime=..., memory=...)`:
        Adds two new fields to each Submission row in the queryset:
        `.runtime` and `.memory`.
"""

class GetUserProblemSubmissionsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        problem = get_object_or_404(Problem, slug=slug)

        try:
            submissions = problem.submissions.filter(user=request.user).order_by('-created_at').annotate(
                runtime = Max(Cast("testcases__time", FloatField())),
                memory = Max(Cast("testcases__memory", FloatField()))
            )
            
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

        submissionTestcases = submission.testcases.all()
        
        totalTestCases = submissionTestcases.count()
        # print(totalTestCases)

        totalPassedTestCases = submissionTestcases.filter(status="Accepted").count()
        # print(totalPassedTestCases)

        failedTestCases = submissionTestcases.filter(
            Q(status="Wrong Answer") | Q(status="Runtime Error") | Q(status="Time Limit Exceeded") | Q(status="Compilation Error")
        )
    
        return Response(
            {
                "message" : "submission fetched successfully",
                "success" : True,
                "data" : serializer.data,
                "totalTestCases" : totalTestCases,
                "totalPassedTestCases" : totalPassedTestCases,
                "failedTestCases" : GetUserProblemSubmissionTestCasesSerializer(
                    failedTestCases,
                    many=True
                ).data
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
        


class GetSearchResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('query')
        try:

            # Define the subquery
            subquery = Submission.objects.filter(
                problem=OuterRef('pk'),   # links Problem to Submission
                user=request.user,        # filters submissions by logged-in user
                status="Passed"           # filters submissions where status is "passed"
            )
        
            problems = Problem.objects.annotate(
                user_submission_passed = Exists(subquery)
            ).order_by('-created_at').filter(
                Q(title__icontains=query)
            )

            serializer = GetAllProblemSerializer(problems, many=True)

            return Response(
                {
                    "message" : "Search result fetched successfully",
                    "success" : True,
                    "data" : serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    "message" : "Error occured while fetching search result",
                    "success" : False,
                    "error" : str(e)
                }
            )


class GetAllLanguages(APIView):
    def get(self, request):
        languages = Language.objects.all()

        serializer = GetAllLanguagesSerializer(languages, many=True)

        return Response(
            {
                "message" : "Languages fetched successfully",
                "success" : True,
                "data" : serializer.data
            },
            status=status.HTTP_200_OK
        )