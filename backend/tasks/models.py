import neomodel

from datetime import datetime
import uuid
import re


class TaskRelationship(neomodel.StructuredRel):
    title = neomodel.StringProperty()


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
    group = neomodel.RelationshipFrom('groups.models.Group', 'CONTAINS_TASK')
    notes = neomodel.RelationshipTo('notes.models.Note', 'HAS_NOTE')
    related_to_tasks = neomodel.RelationshipTo(
        'tasks.models.Task',
        'RELATED_TO',
        model=TaskRelationship
    )
    related_from_tasks = neomodel.RelationshipFrom(
        'tasks.models.Task',
        'RELATED_TO',
        model=TaskRelationship
    )
    history = neomodel.RelationshipTo('history.models.TaskHistory', 'HISTORY')

    def clean(self):
        """Валидация перед сохранением"""
        if not re.match(r'^task_[a-f0-9]{8}$', self.task_id):
            self.task_id = f"task_{uuid.uuid4().hex[:8]}"

    def _track_changes(self, old_task):
        from history.models import TaskHistory

        fields_to_track = TaskHistory.get_fields()

        for field in fields_to_track:
            old_value = getattr(old_task, field, None)
            new_value = getattr(self, field)

            if old_value != new_value:
                history_entry = TaskHistory(
                    changed_field=field,
                    value=str(new_value),
                    change_type='update' if old_value else 'create'
                ).save()
                self.history.connect(history_entry)
                history_entry.task.connect(self)

    def save(self, *args, **kwargs):
        old_task = None
        try:
            old_task = (Task.nodes.get(task_id=self.task_id)
                        if self.task_id else None)
        except (Task.DoesNotExist, ValueError):
            pass

        self.updated_at = datetime.now()
        self.clean()

        result = super().save(*args, **kwargs)

        self._track_changes(old_task)

        return result

    def delete(self):
        from history.models import TaskHistory

        TaskHistory(
            changed_field='task',
            change_type='delete',
            old_value=str(self)
        ).save()

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
