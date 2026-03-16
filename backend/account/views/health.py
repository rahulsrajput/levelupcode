from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class HealthCheckView(APIView):
    def get(self, request):
        try:
            connection.ensure_connection()
            return Response({"status": "ok"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": "error", "detail": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    def head(self, request):
        try:
            connection.ensure_connection()
            return Response(status=status.HTTP_200_OK)
        except Exception:
            return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)