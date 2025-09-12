from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.utils.judge0 import poll_batch_results, submit_batch
from core.utils.roleRequired import RoleRequired
from core.serializers.problem import GetProblemSerializer, PatchProblemSerializer
from core.models import Language, Problem


"""
    API view to retrieve, update, and delete a Problem instance.

    Methods:
    --------
    get(request, slug):
        - Retrieves a problem by its slug.
        - Returns the problem’s data.

    patch(request, slug):
        - Partially updates a problem’s fields such as title, description, testcases, reference solutions, etc.
        - Validates input data.
        - Ensures the title is unique.
        - If testcases and reference solutions are provided, validates them via the Judge0 service before saving.
        - Returns the updated problem.

    delete(request, slug):
        - Deletes a problem by its slug.
        - Returns a success message.

    Permissions:
    ------------
    - All requests require the user to be authenticated (IsAuthenticated).
    - For modifying requests (POST, PATCH, DELETE, PUT), additional permissions are enforced:
      only users with 'admin' or 'superadmin' roles are allowed.
    - The get_permissions() method controls this by dynamically appending permissions based on the request method.

    Permissions Workflow:
    --------------------
    1. DRF calls get_permissions() to retrieve a list of permission instances.
    2. Each permission’s has_permission() method is checked in order.
    3. If any permission check fails, DRF stops and returns a 403 Forbidden response.
    4. If all permissions pass, the requested view method (get, patch, delete) is executed.
    5. In this view:
        - For GET requests: only IsAuthenticated() is applied.
        - For PATCH, DELETE, and other modifying requests: both IsAuthenticated() and RoleRequired() are applied,
          ensuring only authorized users can update or delete problems.
"""

class ProblemView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        
        if self.request.method in ['POST', 'PATCH', 'DELETE', 'PUT']:
        
            RolePermissions = RoleRequired(allowed_roles=['admin', 'superadmin'])
            return super().get_permissions() + [RolePermissions()]
        
        return super().get_permissions()
    
   
    def get(self, request, slug):
        
        obj = get_object_or_404(Problem, slug=slug)
            
        return Response(
            {
                "message" : "problem fetched successfully",
                "success" : True,
                "data" : GetProblemSerializer(instance=obj).data
            },
            status=status.HTTP_200_OK
        )

    

    def patch(self, request, slug):
        
        obj = get_object_or_404(Problem, slug=slug)

        data = request.data
        
        serializer = PatchProblemSerializer(instance=obj, data=data, partial=True)

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
        if 'title' in data and Problem.objects.filter(title=data['title']).exclude(id=obj.id).exists():
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


        try:
            # Only proceed with Judge0 validation if reference_solutions and testcases are provided
            if reference_solutions is not None and testcases is not None:
                for language, solution_code in reference_solutions.items():
                    try:
                        languageId = Language.objects.get(
                            name=language.capitalize(),
                            isActive=True
                        ).langId
                    except Language.DoesNotExist:
                        return Response(
                            {
                                "message": f"Language {language} is not supported",
                                "success": False
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

                    tokens = submit_batch(submission)
                    results = poll_batch_results(tokens)

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
                    
           
            # Save the problem after all checks (or if Judge0 checks are skipped)
            problem = serializer.save(user=request.user)
            return Response(
                {
                    "message": "Problem updated successfully",
                    "success": True,
                    "problem": PatchProblemSerializer(problem).data
                }, status=status.HTTP_200_OK
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


    def delete(self, request, slug):
        
        instance = get_object_or_404(Problem, slug=slug)

        instance.delete()

        return Response(
            {
                "message" : "problem deleted successfully",
                "success" : True
            },
            status=status.HTTP_200_OK
        )