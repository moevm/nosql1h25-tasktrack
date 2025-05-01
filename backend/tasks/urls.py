from django.urls import path

from . import views


urlpatterns = [
    path('', views.TaskListCreateAPIView.as_view()),
    path('<str:task_id>/', views.TaskDetailAPIView.as_view()),
    # path('<str:task_id>/relationships/<str:relation_type>/',
    #      views.TaskRelationshipsAPIView.as_view()),
]
