from django.urls import path

from . import views


urlpatterns = [
    path('', views.TaskListCreateAPIView.as_view()),
    path('relationships/', views.TaskRelationsAPIView.as_view()),
    path('<str:task_id>/', views.TaskDetailAPIView.as_view()),
]
