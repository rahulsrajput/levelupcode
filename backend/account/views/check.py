from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from account.serializers.me import MeSerializer

class MeView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        print(request.user)
        return Response({
            "success": True,
            "message": "User is authenticated",
            "data": MeSerializer(request.user).data
        }, status=status.HTTP_200_OK)