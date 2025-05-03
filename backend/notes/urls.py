from django.urls import path
from .views import NoteListCreateAPIView, NoteDetailAPIView


app_name = 'notes'

urlpatterns = [
    path('',
         NoteListCreateAPIView.as_view(),
         name='task-note-list'),
    path('<str:note_id>/',
         NoteDetailAPIView.as_view(),
         name='task-note-detail'),
]
