from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from neomodel import db

from users.authentication import available_for_authorized
from .serializers import TagSerializer


@available_for_authorized
class TagsAPIView(APIView):

    def get(self, request):
        with db.transaction:
            user_tags = request.user.tags.all()
            serializer = TagSerializer(
                user_tags,
                many=True,
                context={'owner': request.user}
            )
            return Response({'tags': serializer.data})

    def post(self, request):
        with db.transaction:
            context = {'owner': request.user}
            serializer = TagSerializer(
                data=request.data,
                context=context
            )

            serializer.is_valid(raise_exception=True)
            tag = serializer.save()

            return Response(
                TagSerializer(tag, context=context).data,
                status=status.HTTP_201_CREATED
            )


@available_for_authorized
class TagDetailAPIView(APIView):

    def get_tag(self, user, name):
        tags = user.tags.filter(name=name)
        if tags:
            return tags[0]
        return None

    def get(self, request, name):
        with db.transaction:
            tag = self.get_tag(request.user, name)
            if not tag:
                return Response(
                    {'detail': 'Тег не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = TagSerializer(tag, context={'owner': request.user})
            return Response(serializer.data)

    def patch(self, request, name):
        with db.transaction:
            tag = self.get_tag(request.user, name)
            if not tag:
                return Response(
                    {'detail': 'Тег не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )

            context = {'owner': request.user}
            serializer = TagSerializer(
                tag,
                data=request.data,
                context=context,
                partial=True
            )

            serializer.is_valid(raise_exception=True)
            updated_tag = serializer.save()

            return Response(
                TagSerializer(updated_tag, context=context).data
            )

    def delete(self, request, name):
        with db.transaction:
            tag = self.get_tag(request.user, name)
            if not tag:
                return Response(
                    {'detail': 'Тег не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )

            tag.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
