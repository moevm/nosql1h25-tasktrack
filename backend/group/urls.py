from django.urls import path

from .views import GroupsAPIView, GroupDetailAPIView

urlpatterns = [
    path('', view=GroupsAPIView.as_view()),
    path('<str:name>/', view=GroupDetailAPIView.as_view()),
]
