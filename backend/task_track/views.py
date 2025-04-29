from rest_framework.views import APIView
from rest_framework.response import Response


class HealthCheckView(APIView):

    def get(self, request, format=None):
        return Response({"status": "ok"})
