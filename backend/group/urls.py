from django.urls import path, include

from .views import GroupsAPIView

urlpatterns = [
    path('', view=GroupsAPIView.as_view()),
]
