import neomodel

from datetime import datetime
import uuid
import re


class Task(neomodel.StructuredNode):
    STATUS_CHOICES = {
        'todo': 'To Do',
        'in_progress': 'In Progress',
        'done': 'Done',
        'archived': 'Archived'
    }

    PRIORITY_CHOICES = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High',
        'critical': 'Critical'
    }

    task_id = neomodel.StringProperty(
        unique_index=True,
        default=lambda: f"task_{uuid.uuid4().hex[:8]}"
    )
    title = neomodel.StringProperty(required=True)
    content = neomodel.StringProperty()
    created_at = neomodel.DateTimeProperty(default=datetime.now)
    deadline = neomodel.DateTimeProperty(
        required=True,
        validators=[lambda val: val > datetime.now()]
    )
    updated_at = neomodel.DateTimeProperty(default=datetime.now)
    status = neomodel.StringProperty(choices=STATUS_CHOICES, default='todo')
    priority = neomodel.StringProperty(
        choices=PRIORITY_CHOICES,
        default='medium'
    )

    tags = neomodel.RelationshipTo('tags.models.Tag', 'HAS_TAG')
    related_to_tasks = neomodel.RelationshipTo('tasks.models.Task', 'RELATED_TO')
    related_from_tasks = neomodel.RelationshipFrom('tasks.models.Task', 'RELATED_TO')
    group = neomodel.RelationshipFrom('groups.models.Group', 'CONTAINS_TASK')
    notes = neomodel.RelationshipTo('notes.models.Note', 'HAS_NOTE')

    def clean(self):
        """Валидация перед сохранением"""
        if not re.match(r'^task_[a-f0-9]{8}$', self.task_id):
            self.task_id = f"task_{uuid.uuid4().hex[:8]}"

    def save(self, *args, **kwargs):
        self.updated_at = datetime.now()
        self.clean()
        return super().save(*args, **kwargs)

    def delete(self):
        query = """
        MATCH (task:Task {task_id: $task_id})
        OPTIONAL MATCH (task)-[:HAS_TAG]->(tag:Tag)
        OPTIONAL MATCH (task)-[:HAS_NOTE]->(note:Note)
        OPTIONAL MATCH (task)-[rel:RELATED_TO]-(other:Task)
        DELETE rel
        DETACH DELETE note, task
        """
        neomodel.db.cypher_query(query, {'task_id': self.task_id})

    def __str__(self):
        return f"{self.task_id}: {self.title} ({self.status})"
