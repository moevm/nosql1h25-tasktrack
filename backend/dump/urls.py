from django.urls import path
from .views import Neo4jDumpView

urlpatterns = [
    path(
        'dump/',
        Neo4jDumpView.as_view(),
        name='dump-database',
    ),
]
