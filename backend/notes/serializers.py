from neomodel import db
from rest_framework import serializers
from .models import Note
from tasks.models import Task


class NoteSerializer(serializers.Serializer):
    note_id = serializers.CharField(read_only=True)
    text = serializers.CharField(required=True)
    created_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        """Создание заметки с привязкой к задаче"""
        task_id = self.context['task_id']
        note = Note(text=validated_data['text'])
        note.save()

        task = Task.nodes.get(task_id=task_id)
        task.notes.connect(note)

        return note

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        query = """
        MATCH (t:Task)-[:HAS_NOTE]->(n:Note {note_id: $note_id})
        RETURN t
        LIMIT 1
        """
        results, _ = db.cypher_query(query, {'note_id': instance.note_id})

        if results and results[0][0]:
            task = Task.inflate(results[0][0])
            representation['task'] = {
                'task_id': task.task_id,
                'title': task.title
            }
        else:
            representation['task'] = {
                'task_id': None,
                'title': None
            }

        return representation
