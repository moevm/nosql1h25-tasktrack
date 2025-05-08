from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from neomodel import db

from .serializers import GroupSerializer
from .models import Group
from users.authentication import available_for_authorized


@available_for_authorized
class GroupsAPIView(APIView):

    def get(self, request):
        with db.transaction:
            user_groups = request.user.groups.all()
            serializer = GroupSerializer(user_groups, many=True)
            return Response({'groups': serializer.data})

    def post(self, request):
        with db.transaction:
            serializer = GroupSerializer(
                data=request.data,
                context={'user': request.user}
            )
            serializer.is_valid(raise_exception=True)
            group = serializer.save()
            request.user.groups.connect(group)
            return Response(
                GroupSerializer(group).data,
                status=status.HTTP_201_CREATED
            )


@available_for_authorized
class GroupDetailAPIView(APIView):

    def get_object(self, user, name):
        try:
            return user.groups.get(name=name.lower().strip())
        except Group.DoesNotExist:
            return None

    def get(self, request, name):
        with db.transaction:
            group = self.get_object(request.user, name)
            if not group:
                return Response(
                    {'error': 'Group not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = GroupSerializer(group)
            return Response(serializer.data)

    # def patch(self, request, name):
    #     with db.transaction:
    #         group = self.get_object(request.user, name)
    #         if not group:
    #             return Response(
    #                 {'error': 'Group not found'},
    #                 status=status.HTTP_404_NOT_FOUND
    #             )

    #         serializer = GroupSerializer(
    #             group,
    #             data=request.data,
    #             partial=True,
    #             context={'user': request.user}
    #         )

    #         if serializer.is_valid():
    #             serializer.save()
    #             return Response(serializer.data)
    #         return Response(
    #             serializer.errors,
    #             status=status.HTTP_400_BAD_REQUEST
    #         )

    # def delete(self, request, name):
    #     with db.transaction:
    #         group = self.get_object(request.user, name)
    #         if not group:
    #             return Response(
    #                 {'error': 'Group not found'},
    #                 status=status.HTTP_404_NOT_FOUND
    #             )
    #         group.delete()
    #         return Response(status=status.HTTP_204_NO_CONTENT)
