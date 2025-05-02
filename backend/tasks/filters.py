from datetime import datetime


class TaskFilter:
    def __init__(self, data=None):
        self.data = data or {}

    def filter(self, queryset):
        if 'title' in self.data:
            queryset = [
                t for t in queryset
                if self.data['title'].lower() in t.title.lower()]

        if 'status' in self.data:
            queryset = [
                t for t in queryset if t.status == self.data['status']]

        if 'priority' in self.data:
            queryset = [
                t for t in queryset if t.priority == self.data['priority']]

        if 'deadline_before' in self.data:
            deadline = datetime.fromisoformat(self.data['deadline_before'])
            queryset = [t for t in queryset if t.deadline <= deadline]

        if 'deadline_after' in self.data:
            deadline = datetime.fromisoformat(self.data['deadline_after'])
            queryset = [t for t in queryset if t.deadline >= deadline]

        if 'created_before' in self.data:
            created = datetime.fromisoformat(self.data['created_before'])
            queryset = [t for t in queryset if t.created_at <= created]

        if 'created_after' in self.data:
            created = datetime.fromisoformat(self.data['created_after'])
            queryset = [t for t in queryset if t.created_at >= created]

        if 'tag' in self.data:
            tag_name = self.data['tag']
            queryset = [
                t for t in queryset
                if any(
                    tag.name.lower() == tag_name.lower()
                    for tag in t.tags.all())
            ]

        return queryset
