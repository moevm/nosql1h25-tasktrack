from django.urls import path, include

from .views import HealthCheckView


urlpatterns = [
    path('api/health/', HealthCheckView.as_view()),
    path('api/', include('users.urls')),
    path('api/group/', include('group.urls')),
]
