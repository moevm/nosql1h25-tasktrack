from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def drf_api_view(request):
    return Response({
        'message': 'DRF API Response',
        'neo4j_connected': True
    })


@api_view(['GET'])
def health_check(request):
    return Response({"status": "ok"})
