from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from neomodel import db
from .models import Note
from .serializers import NoteSerializer
from users.authentication import available_for_authorized


@available_for_authorized
class NoteListCreateAPIView(APIView):
    def _validate_task_access(self, user_email, task_id):
        """Проверяем доступ к задаче через группу"""
        try:
            query = """
            MATCH (u:Neo4jUser {email: $email})-[:OWNS_GROUP|MEMBER_OF]->(g:Group)
            WHERE EXISTS((g)-[:CONTAINS_TASK]->(:Task {task_id: $task_id}))
            RETURN count(g) > 0 as has_access
            """
            results, _ = db.cypher_query(query, {
                'email': user_email,
                'task_id': task_id
            })
            return results[0][0] if results else False
        except Exception as e:
            print(f"Task access validation failed: {str(e)}")
            return False

    def get(self, request, task_id):
        """Получение всех заметок задачи"""

        reverse = request.query_params.get('reverse', '').lower() == 'true'

        if not self._validate_task_access(request.user.email, task_id):
            return Response(
                {'error': 'Task not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            query = """
            MATCH (t:Task {{task_id: $task_id}})-[:HAS_NOTE]->(n:Note)
            RETURN n
            ORDER BY n.created_at {order}
            """.format(order="ASC" if reverse else "DESC")

            results, _ = db.cypher_query(query, {'task_id': task_id})
            notes = [Note.inflate(row[0]) for row in results]

            serializer = NoteSerializer(notes, many=True)
            return Response({'notes': serializer.data})

        except Exception as e:
            return Response(
                {'error': f"Failed to fetch notes: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, task_id):
        """Создание новой заметки для задачи"""
        if not self._validate_task_access(request.user.email, task_id):
            return Response(
                {'error': 'Task not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = NoteSerializer(
            data=request.data,
            context={'request': request, 'task_id': task_id}
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            note = serializer.save()
            return Response(
                NoteSerializer(note).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': f"Failed to create note: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@available_for_authorized
class NoteDetailAPIView(APIView):
    def get_note(self, user, task_id, note_id):
        """Проверяем существование заметки и права доступа"""
        query = """
        MATCH (u:Neo4jUser)-[:OWNS_GROUP]->(g:Group)-[:CONTAINS_TASK]->(t:Task {task_id: $task_id})-[:HAS_NOTE]->(n:Note {note_id: $note_id})
        WHERE u.email = $email
        RETURN n
        """
        results, _ = db.cypher_query(query, {
            'email': user.email,
            'task_id': task_id,
            'note_id': note_id
        })
        return Note.inflate(results[0][0]) if results else None

    def get(self, request, task_id, note_id):
        """Получение конкретной заметки"""
        note = self.get_note(request.user, task_id, note_id)
        if not note:
            return Response(
                {'error': 'Note not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = NoteSerializer(note, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, task_id, note_id):
        """Удаление заметки"""
        note = self.get_note(request.user, task_id, note_id)
        if not note:
            return Response(
                {'error': 'Note not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )

        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
