from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import (ValidationError, NotFound,
                                       PermissionDenied)

from neomodel import db

from .models import Task
from .serializers import TaskSerializer
from .pagination import StandardResultsSetPagination
from .filters import TaskFilter
from .sorting import TaskSorter
from users.authentication import available_for_authorized


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

            serializer.is_valid(raise_exception=True)
            task = serializer.save()
            return Response(
                TaskSerializer(task, context={'request': request}).data,
                status=status.HTTP_201_CREATED
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

            serializer.is_valid(raise_exception=True)
            updated_task = serializer.save()
            return Response(
                TaskSerializer(updated_task, context={
                    'request': request}).data
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


@available_for_authorized
class TaskRelationsAPIView(APIView):

    def _get_task_ids(self, request):
        task_id_from = request.data.get('task_id_from')
        task_id_to = request.data.get('task_id_to')
        if not task_id_from or not task_id_to:
            raise ValidationError(
                {'error': 'Both task_id_from and task_id_to are required'},
                code=status.HTTP_400_BAD_REQUEST
            )
        return task_id_from, task_id_to

    def _get_task(self, user, task_id):
        task = Task.nodes.get_or_none(task_id=task_id)
        if task is None:
            raise NotFound(
                detail=f'Task {task_id} not found',
                code=status.HTTP_404_NOT_FOUND
            )

        group = task.group.single()
        if not group or not user.groups.is_connected(group):
            raise PermissionDenied(
                detail=f'Access denied for task {task_id}',
                code=status.HTTP_403_FORBIDDEN
            )
        return task

    def _get_tasks(self, user, task_id_from, task_id_to):
        task_from = self._get_task(user, task_id_from)
        task_to = self._get_task(user, task_id_to)

        if task_from.group.single() != task_to.group.single():
            raise ValidationError(
                {'error': 'Tasks must be in the same group'},
                code=status.HTTP_400_BAD_REQUEST
            )
        return task_from, task_to

    def _check_relation_exists(self, task_id_from, task_id_to):
        query = """
        MATCH (start:Task {task_id: $task_id_from})
        MATCH (end:Task {task_id: $task_id_to})
        RETURN EXISTS((start)-[:RELATED_TO*]->(end)) AS related
        """
        results, _ = db.cypher_query(query, {
            'task_id_from': task_id_from,
            'task_id_to': task_id_to
        })
        return results[0][0]

    def post(self, request):
        with db.transaction:
            title = request.data.get('title')
            if not title:
                return Response(
                    {'error': 'Title is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            task_id_from, task_id_to = self._get_task_ids(request)
            task_from, task_to = self._get_tasks(
                request.user, task_id_from, task_id_to)

            if task_id_from == task_id_to:
                return Response(
                    {'error': 'Task cannot be related to itself'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if self._check_relation_exists(task_id_to, task_id_from):
                return Response(
                    {'error': ('Creating a link will result '
                               'in a cyclic dependency')},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if task_from.related_to_tasks.is_connected(task_to):
                return Response(
                    {'error': 'Task is already related'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            task_from.related_to_tasks.connect(
                task_to,
                {'title': title}
            )
            task_to.related_from_tasks.connect(
                task_from,
                {'title': title}
            )

            serializer_from = TaskSerializer(
                task_from, context={'request': request}
            )
            serializer_to = TaskSerializer(
                task_to, context={'request': request}
            )

            return Response({
                    'task_from': serializer_from.data,
                    'task_to': serializer_to.data
                }, status=status.HTTP_201_CREATED)

    def delete(self, request):
        with db.transaction:
            task_id_from, task_id_to = self._get_task_ids(request)
            task_from, task_to = self._get_tasks(
                request.user, task_id_from, task_id_to)

            if task_id_from == task_id_to:
                return Response(
                    {'error': 'Task cannot be delete relationships to itself'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not task_from.related_to_tasks.is_connected(task_to):
                return Response(
                    {'error': 'Task is not related'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            task_from.related_to_tasks.disconnect(task_to)
            task_to.related_from_tasks.disconnect(task_from)

            serializer_from = TaskSerializer(
                task_from, context={'request': request}
            )
            serializer_to = TaskSerializer(
                task_to, context={'request': request}
            )

            return Response({
                    'task_from': serializer_from.data,
                    'task_to': serializer_to.data
                }, status=status.HTTP_201_CREATED)
