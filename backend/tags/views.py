from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from users.authentication import available_for_authorized
from .serializers import TagSerializer
from .models import Tag


@available_for_authorized
class TagsAPIView(APIView):
    def get(self, request):
        tags = Tag.nodes.all()
        serializer = TagSerializer(tags, many=True)
        return Response({'tags': serializer.data})

    def post(self, request):
        serializer = TagSerializer(data=request.data)
        if serializer.is_valid():
            tag = serializer.save()
            return Response(
                TagSerializer(tag).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@available_for_authorized
class TagDetailAPIView(APIView):
    def get(self, request, name):
        name = name.lower().strip()
        tag = Tag.nodes.get(name=name)
        serializer = TagSerializer(tag)
        return Response(serializer.data)

    # def put(self, request, name):
    #     name = name.lower().strip()
    #     tag = Tag.nodes.get(name=name)
    #     serializer = TagSerializer(tag, data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def delete(self, request, name):
    #     name = name.lower().strip()
    #     tag = Tag.nodes.get(name=name)
    #     tag.delete()
    #     return Response(status=status.HTTP_204_NO_CONTENT)
