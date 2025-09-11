from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.utils.roleRequired import RoleRequired


class ProblemView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        
        if self.request.method in ['POST', 'PATCH', 'DELETE', 'PUT']:
        
            RolePermissions = RoleRequired(allowed_roles=['admin', 'superadmin'])
            return super().get_permissions() + [RolePermissions()]
        
        return super().get_permissions()
    
   
    def get(self, request, id):
        return Response(
            {
                "message" : "problem fetched successfully",
                "success" : True
            },
            status=status.HTTP_200_OK
        )
    

    def patch(self, request, id):
        return Response(
            {
                "message" : "problem partially updated successfully",
                "success" : True
            },
            status=status.HTTP_200_OK
        )
    

    def delete(self, request, id):
        return Response(
            {
                "message" : "problem deleted successfully",
                "success" : True
            },
            status=status.HTTP_200_OK
        )