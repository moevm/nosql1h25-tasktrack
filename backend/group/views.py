from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from task_track.settings import DRIVER
from users.authentication import available_for_authorized

from .models import Neo4jGroup, Neo4jUserGroup


@available_for_authorized
class GroupsAPIView(APIView):

    def get(self, request):
        session = DRIVER.get_session()
        email = request.user.email
        groups = Neo4jUserGroup(user_email=email)\
            .request(session).get_groups_contains()
        return Response({'result': groups})

    def post(self, request):
        group_name = request.data.get('name')

        if not group_name:
            return Response(
                {'error': 'group_name of groups is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        session = DRIVER.get_session()
        user_email = request.user.email
        request = Neo4jGroup.request(session)

        if request.get_only_single(group_name=group_name):
            return Response(
                {'error': 'Group with this name already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            group = request.create(group_name=group_name)
            Neo4jUserGroup(user_email=user_email, group_name=group_name).request(
                session).save()
            return Response(
                {'name': group.name},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
