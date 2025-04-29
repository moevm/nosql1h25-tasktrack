from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Group
from .serializers import GroupSerializer
from users.authentication import available_for_authorized


@available_for_authorized
class GroupsAPIView(APIView):
    def get(self, request):
        user = request.user
        user_groups = user.groups.all()
        serializer = GroupSerializer(user_groups, many=True)
        return Response({'groups': serializer.data})

    def post(self, request):
        serializer = GroupSerializer(
            data=request.data,
            context={'user': request.user}
        )
        if serializer.is_valid():
            group = serializer.save()
            request.user.groups.connect(group)

            return Response(
                GroupSerializer(group).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@available_for_authorized
class GroupDetailAPIView(APIView):
    def get(self, request, name):
        name = name.lower().strip()
        group = request.user.groups.get(name=name)
        serializer = GroupSerializer(group)
        return Response(serializer.data)

    # def put(self, request, name):
    #     name = name.lower().strip()
    #     group = request.user.groups.get(name=name)
    #     serializer = GroupSerializer(group, data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def delete(self, request, name):
    #     name = name.lower().strip()
    #     group = request.user.groups.get(name=name)
    #     group.delete()
    #     return Response(status=status.HTTP_204_NO_CONTENT)
