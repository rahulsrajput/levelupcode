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
        
        data = request.data
        
        serializer = CreateProblemSerializer(data=data)

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Invalid data",
                    "success": False,
                    "errors": serializer.errors
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )


        # Check if title already exists
        if Problem.objects.filter(title=data.get('title')).exists():
            return Response(
                {
                    "message": "Problem with this title already exists",
                    "success": False
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        

        # Proceed to Judge0 checks
        testcases = data.get('testcases')
        reference_solutions = data.get('reference_solutions')
        # print(data)


        try:
            for language, solution_code in reference_solutions.items():
                # print(language.lower().capitalize(), solution_code)
                
                try:
                    languageId = Language.objects.get(
                        name = language.capitalize(),
                        isActive = True
                    ).langId
                    # print(languageId)
                except Language.DoesNotExist:
                    return Response(
                        {
                            "message" : f"Language {language} is not supported",
                            "success" : False
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                
                submission = [
                    {
                        'language_id': languageId,
                        'source_code': solution_code,
                        'stdin': tc['input'],
                        'expected_output': tc['expected'],
                    }
                    for tc in testcases
                ]
                # print("SUBMISSION: ",submission)

                tokens = submit_batch(submission)
                # print(tokens)

                results = poll_batch_results(tokens)
                # print("RESULT: ",results)
                
                
                for index, res in enumerate(results):
                    if res['status']['id'] != 3:
                        return Response(
                            {
                                "message": f"Reference solution for language {language} failed for testcase #{index + 1}",
                                "success": False,
                                "error": res
                            }, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
            # All checks passed, save the problem
            problem = serializer.save(user=request.user)

            return Response(
                {
                    "message": "Problem created successfully",
                    "success": True,
                    "problem": CreateProblemSerializer(problem).data
                }, status=status.HTTP_201_CREATED
            )


        except Exception as e:
            return Response(
                {
                    "message" : "An error occurred",
                    "success" : False,
                    "error" : str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

        