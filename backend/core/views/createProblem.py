from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.utils.roleRequired import RoleRequired
from core.serializers.createProblem import CreateProblemSerializer
from core.models import Language
from core.utils.judge0 import submit_batch, poll_batch_results
from core.models import Problem


class CreateProblemView(APIView):

    """ 
        going to get all the data from the request body
        checking if the user is admin or not for creating the problem
        loop through each refrence solution for different languages
        for each refrence solution loop through each testcase
        submit the refrence solution and testcase to judge0
        if any of the testcase fails for any of the refrence solution return error
        if all the testcases pass for all the refrence solution save the problem to the database
        return success response with problem data
        otherwise return error response
    """
    
    """
        About permission_classes:
        - IsAuthenticated: Ensures that the user is authenticated.
        - RoleRequired(['admin']): Custom permission to ensure that only users with the 'admin' role can access this view.
        How Permission Classes Work:
            When a request is made to this view, Django REST Framework checks each permission class in the list.
            If any permission class denies access, the request is denied and an appropriate error response is returned.
            If all permission classes grant access, the request proceeds to the view's logic.
            permission classes are checked in the order they are listed.

            - get_permissions method in ProblemView returns a list of permission instances.
            - Each permission class has a has_permission method that takes the request and view as arguments.
            - The has_permission method contains the logic to determine if the request should be granted or denied access based on the user's role amd returns True or False.

            when view is accessed, the get_permissions method is called to retrieve the list of permission instances.
            - Each permission instance's has_permission method is called to check if the request should be granted access.
    """
    
    permission_classes = [IsAuthenticated, RoleRequired(['admin'])]
   
    def post(self, request):
        # Ensure request.data is always a list
        data_list = request.data
        if isinstance(data_list, dict):
            data_list = [data_list]

        serializer = CreateProblemSerializer(data=data_list, many=True)

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Invalid data",
                    "success": False,
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        valid_data = []
        failed_problems = []

        for data in data_list:
            title = data.get('title')

            # Check title uniqueness
            if Problem.objects.filter(title=title).exists():
                failed_problems.append({
                    "title": title,
                    "status": "failed",
                    "error": "Problem with this title already exists"
                })
                continue

            testcases = data.get('testcases', [])
            reference_solutions = data.get('reference_solutions', {})

            problem_failed = False
            error_detail = None

            try:
                for language, solution_code in reference_solutions.items():
                    try:
                        languageId = Language.objects.get(
                            name=language.capitalize(),
                            isActive=True
                        ).langId
                    except Language.DoesNotExist:
                        problem_failed = True
                        error_detail = f"Language {language} is not supported"
                        break

                    submission = [
                        {
                            'language_id': languageId,
                            'source_code': solution_code,
                            'stdin': tc['input'],
                            'expected_output': tc['expected'],
                        }
                        for tc in testcases
                    ]

                    tokens = submit_batch(submission)
                    results = poll_batch_results(tokens)

                    for index, res in enumerate(results):
                        if res['status']['id'] != 3:
                            problem_failed = True
                            error_detail = f"Reference solution for language {language} failed for testcase #{index + 1}"
                            break

                    if problem_failed:
                        break

            except Exception as e:
                problem_failed = True
                error_detail = str(e)

            if problem_failed:
                failed_problems.append({
                    "title": title,
                    "status": "failed",
                    "success": False,
                    "error": error_detail
                })
            else:
                valid_data.append(data)

        # Save all valid problems in bulk
        saved_problems = []
        if valid_data:
            valid_serializer = CreateProblemSerializer(data=valid_data, many=True)
            valid_serializer.is_valid(raise_exception=True)
            saved_problems = valid_serializer.save(user=request.user)

        if len(saved_problems) + len(failed_problems) > 1:
            # Bulk upload response
            return Response(
                {
                    "message": "Bulk upload completed",
                    "success_count": len(saved_problems),
                    "failed_count": len(failed_problems),
                    "saved_problems": CreateProblemSerializer(saved_problems, many=True).data,
                    "failed_problems": failed_problems
                },
                status=status.HTTP_207_MULTI_STATUS
            )
        else:
            # Single problem response
            if saved_problems:
                return Response(
                    {
                        "message": "Problem created successfully",
                        "success": True,
                        "problem": CreateProblemSerializer(saved_problems[0]).data
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {
                        "message": "Problem creation failed",
                        "success": False,
                        "error": failed_problems[0]["error"] if failed_problems else "Unknown error"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
