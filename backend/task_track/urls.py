from django.urls import path, include

from .views import HealthCheckView


urlpatterns = [
    path('api/health/', HealthCheckView.as_view()),
    path('api/user/', include('users.urls')),
    path('api/group/', include('groups.urls')),
    path('api/tag/', include('tags.urls')),
    path('api/task/', include('tasks.urls')),
    path('api/task/<str:task_id>/note/', include('notes.urls')),
    path('api/database/', include('dump.urls')),
]
