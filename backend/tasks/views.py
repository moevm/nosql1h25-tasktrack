from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from neomodel import db

from .models import Task
from .serializers import TaskSerializer
from users.authentication import available_for_authorized
from .pagination import StandardResultsSetPagination
from .filters import TaskFilter
from .sorting import TaskSorter


@available_for_authorized
class TaskListCreateAPIView(APIView):
    pagination_class = StandardResultsSetPagination

    def _get_user_tasks(self, user, filters=None, sort_by=None, reverse=None):
        query = """
        MATCH (u:Neo4jUser)-[:OWNS_GROUP]->(g:Group)-[:CONTAINS_TASK]->(t:Task)
        WHERE u.email = $email
        """
        params = {'email': user.email}

        if filters:
            query, params = TaskFilter.add_filters_to_query(
                query, params, filters)

        if sort_by:
            query, params = TaskSorter.add_sorting_to_query(
                query, params, sort_by, reverse)
        else:
            query += " RETURN t"

        results, _ = db.cypher_query(query, params)
        return [Task.inflate(row[0]) for row in results]

    def get(self, request):
        with db.transaction:
            sort_by = request.query_params.get('sort_by')
            if sort_by:
                sort_by = sort_by.lower()
            reverse = request.query_params.get('reverse')

            filters = request.query_params

            tasks = self._get_user_tasks(
                request.user,
                filters=filters,
                sort_by=sort_by,
                reverse=reverse)

            paginator = self.pagination_class()
            page = paginator.paginate_queryset(tasks, request)

            serializer = TaskSerializer(
                page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        with db.transaction:
            serializer = TaskSerializer(
                data=request.data,
                context={'request': request}
            )

            if serializer.is_valid():
                task = serializer.save()
                return Response(
                    TaskSerializer(task, context={'request': request}).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )


@available_for_authorized
class TaskDetailAPIView(APIView):

    def get_task(self, user, task_id):
        task = Task.nodes.get_or_none(task_id=task_id)
        if task is None:
            return None

        group = task.group.single()
        if group and user.groups.is_connected(group):
            return task

        return None

    def get(self, request, task_id):
        with db.transaction:
            task = self.get_task(request.user, task_id)
            if not task:
                return Response(
                    {'error': 'Task not found or access denied'},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = TaskSerializer(task, context={'request': request})
            return Response(serializer.data)

    def patch(self, request, task_id):
        with db.transaction:
            task = self.get_task(request.user, task_id)

            data = request.data.copy()

            serializer = TaskSerializer(
                task,
                data=data,
                partial=True,
                context={'request': request}
            )

            if serializer.is_valid():
                updated_task = serializer.save()
                return Response(
                    TaskSerializer(updated_task, context={
                                   'request': request}).data
                )
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, task_id):

        with db.transaction:
            task = self.get_task(request.user, task_id)
            if not task:
                return Response(
                    {'error': 'Task not found or access denied'},
                    status=status.HTTP_404_NOT_FOUND
                )

            task.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
