import neomodel

from datetime import datetime


class TaskHistory(neomodel.StructuredNode):
    TYPE_CHOICES = {
        'create': 'Create',
        'update': 'Update',
        'delete': 'Delete',
    }

    changed_at = neomodel.DateTimeProperty(default=datetime.now)
    changed_field = neomodel.StringProperty(required=True, index=True)
    value = neomodel.StringProperty()
    change_type = neomodel.StringProperty(choices=TYPE_CHOICES)

    task = neomodel.RelationshipFrom('tasks.models.Task', 'HISTORY')

    @classmethod
    def get_fields(cls):
        return ['title', 'content', 'deadline', 'status', 'priority', 'tags']

    def __str__(self):
        return f"{self.changed_at}: {self.change_type} on {self.changed_field}"
