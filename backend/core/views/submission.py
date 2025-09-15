from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.models import Problem, Language, Submission, SubmissionTestCase
from django.shortcuts import get_object_or_404
from core.serializers.submission import SubmitProblemSerializer
from core.utils.judge0 import submit_batch, poll_batch_results


"""
    1. Get problem from db
    2. check if request data is valid through serializer
    3. Get language id from db
    4. Create submission and submissiontestcase rows for each testcase stored in problem object in JSON format
    5. create batch of submissions to judge0
    6. send batch to judge0
    7. will get tokens from judge0
    8. will update submissiontestcase objects
    9. return submission id 
"""


class SubmitProblemView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        problem = get_object_or_404(Problem, slug=request.data.get('problem'))

        try:
            serializer = SubmitProblemSerializer(data=request.data)
        
            if not serializer.is_valid():
                return Response(
                    {
                        "message" : "Invalid data",
                        "success" : False,
                        "error" : serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        

            # 1. Get Language id from db
            try:
                language = Language.objects.get(
                    name = serializer.validated_data.get('language').capitalize(),
                    isActive = True
                )
            except Language.DoesNotExist:
                return Response(
                    {
                        "message" : "Language not found",
                        "success" : False
                    },
                    status=status.HTTP_400_BAD_REQUEST
                 )

            source_code = serializer.validated_data.get('source_code')

            # 2 create submission
            submission = Submission.objects.create(
                user = request.user,
                problem=problem,
                language=language,
                source_code=source_code,
                status=Submission.Status.PENDING
            )
        
            # 3. Create SubmissionTestCase rows
            testcases = []
            batch = []
        
            for tc in problem.testcases:
                stc = SubmissionTestCase(
                    submission=submission,
                    input_data=tc["input"],
                    expected_output=tc["expected"],
                    status=SubmissionTestCase.Status.IN_QUEUE
                )
                testcases.append(stc)

                batch.append(
                    {
                        "language_id": language.langId,
                        "source_code": source_code,
                        "stdin": tc["input"],
                        "expected_output": tc["expected"],
                    }
                )
            SubmissionTestCase.objects.bulk_create(testcases)

            # 4. Send batch to Judge0
            try : 
                tokens = submit_batch(batch) # returns ["tok1", "tok2", ...]
                
                """
                    can use zip() to map tokens to testcases and update them
                    The zip() function takes multiple iterables (like lists, tuples, etc.) and pairs up the elements from each iterable based on their position (index).
                """
                
                for idx, testcase in enumerate(testcases):
                    testcase.token = tokens[idx]

                SubmissionTestCase.objects.bulk_update(testcases, ["token"])

            except Exception as e:
                return Response(
                    {
                        "message" : "Failed to send to Judge0",
                        "success" : False,
                        "error" : str(e)
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        

            return Response(
                {
                    "submission_id": submission.id,
                    "message": "Submission created successfully",
                    "success" : True
                },
                status=status.HTTP_201_CREATED
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


class SubmitProblemStatusView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        
        submission = get_object_or_404(Submission, id=id, user=request.user)

        # Get all tokens for this submission
        tokens = list(submission.testcases.values_list("token", flat=True))

        if not tokens:
            return Response(
                {
                    "message" : "no test cases found",
                    "success" : False
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Poll Judge0
            results = poll_batch_results(tokens=tokens)
            # print(results)

            # Update SubmissionTestCase objects
            testcase_mp = {tc.token:tc for tc in submission.testcases.all()}
            # print(testcase_mp)

            for r in results:
                tc = testcase_mp[r['token']]
                tc.stdout = r.get("stdout")
                tc.stderr = r.get("stderr")
                tc.memory = r.get("memory")
                tc.time = r.get("time")
                tc.status = r['status']['description']
                tc.compile_output = r.get('compile_output')
                tc.save()
                
            statuses = [tc.status for tc in submission.testcases.all()]

            if all(s == "Accepted" for s in statuses):
                submission.status = Submission.Status.PASSED
            elif any(s in ["Runtime Error", "Wrong Answer", "Compilation Error",  "Time Limit Exceeded"] for s in statuses):
                submission.status = Submission.Status.FAILED
            else:
                submission.status = Submission.Status.PENDING

            submission.save()

            return Response(
                {
                    "message" : "Updated data fetched",
                    "success" : True,
                    "submission_id": submission.id,
                    "status": submission.status,
                    "testcases": [
                        {
                            "id": tc.id,
                            "input": tc.input_data,
                            "expected": tc.expected_output,
                            "stdout": tc.stdout,
                            "stderr": tc.stderr,
                            "status": tc.status,
                        }
                        for tc in submission.testcases.all()
                    ]
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "message" : "Failed to get updated data",
                    "success" : False,
                    "error" : str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )