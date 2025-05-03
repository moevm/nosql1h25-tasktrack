from datetime import datetime
from django.utils import timezone


class TaskFilter:
    def __init__(self, data=None):
        self.data = data or {}

    def _parse_datetime(self, dt_str):
        try:
            naive_dt = datetime.fromisoformat(dt_str)
            return timezone.make_aware(naive_dt, timezone=timezone.utc)

        except (ValueError, TypeError) as e:
            print(f"Invalid datetime format: {e}")
            return None

    def filter_queryset(self, queryset):
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
            deadline = self._parse_datetime(self.data['deadline_before'])
            if deadline:
                queryset = [
                    t for t in queryset
                    if t.deadline and t.deadline <= deadline
                ]

        if 'deadline_after' in self.data:
            deadline = self._parse_datetime(self.data['deadline_after'])
            if deadline:
                queryset = [
                    t for t in queryset
                    if t.deadline and t.deadline >= deadline
                ]

        if 'created_before' in self.data:
            created = self._parse_datetime(self.data['created_before'])
            if created:
                queryset = [
                    t for t in queryset
                    if t.created_at and t.created_at <= created
                ]

        if 'created_after' in self.data:
            created = self._parse_datetime(self.data['created_after'])
            if created:
                queryset = [
                    t for t in queryset
                    if t.created_at and t.created_at >= created
                ]

        if 'tag' in self.data:
            tag_name = self.data['tag']
            queryset = [
                t for t in queryset
                if any(
                    tag.name.lower() == tag_name.lower()
                    for tag in t.tags.all())
            ]

        return queryset
