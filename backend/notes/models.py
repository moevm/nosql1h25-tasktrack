import neomodel

from datetime import datetime
import uuid
import re


class Note(neomodel.StructuredNode):
    note_id = neomodel.StringProperty(
        unique_index=True,
        default=lambda: f"note_{uuid.uuid4().hex[:8]}"
    )
    text = neomodel.StringProperty(required=True)
    task = neomodel.RelationshipFrom('tasks.models.Task', 'NOTE_HAS')
    created_at = neomodel.DateTimeProperty(default=datetime.now)

    def clean(self):
        """Валидация перед сохранением"""
        if not re.match(r'^note_[a-f0-9]{8}$', self.note_id):
            self.note_id = f"note_{uuid.uuid4().hex[:8]}"

    def save(self, *args, **kwargs):
        self.clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.note_id}: {self.text}"
