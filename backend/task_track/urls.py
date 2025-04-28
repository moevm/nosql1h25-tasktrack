from django.urls import path

from .views import drf_api_view, health_check

urlpatterns = [
    path('api/', drf_api_view),
    path('api/health/', health_check),
]
