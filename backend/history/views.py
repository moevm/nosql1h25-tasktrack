from neomodel import db

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models import TaskHistory
from tasks.models import Task
from .serializers import TaskHistorySerializer
from users.authentication import available_for_authorized


@available_for_authorized
class TaskHistoryView(APIView):

    def get_task(self, user, task_id):
        task = Task.nodes.get_or_none(task_id=task_id)
        if task is None:
            return None

        group = task.group.single()
        print(type(user.groups))
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

            query = """
            MATCH (h:TaskHistory)-[:HISTORY]-(t:Task {task_id: $task_id})
            RETURN h
            ORDER BY h.changed_at DESC
            """

            results, _ = db.cypher_query(query, {'task_id': task_id})

            history_entries = [TaskHistory.inflate(row[0]) for row in results]

            serializer = TaskHistorySerializer(history_entries, many=True)

            return Response({
                'task_id': task_id,
                'count': len(serializer.data),
                'results': serializer.data
            }, status=status.HTTP_200_OK)
