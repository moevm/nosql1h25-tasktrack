from django.urls import path

from .views import TagsAPIView, TagDetailAPIView


urlpatterns = [
    path('', view=TagsAPIView.as_view()),
    path('<str:name>/', view=TagDetailAPIView.as_view()),
]
