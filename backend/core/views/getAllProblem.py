from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.utils.roleRequired import RoleRequired


class GetAllProblemView(APIView):
    
    permission_classes = [IsAuthenticated]
   
    def get(self, request):
        return Response(
            {
                "message" : "all problem fetched successfully",
                "success" : True
            },
            status=status.HTTP_200_OK
        )
    


class GetAllProblemSolvedByUserView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "message" : "all problem solved by user fetched successfully",
                "success" : True
            },
            status=status.HTTP_200_OK
        )