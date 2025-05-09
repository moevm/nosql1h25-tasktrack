from rest_framework import serializers

from .models import Task
from tags.models import Tag
from notes.models import Note

import datetime


class ReadTaskSerializer(serializers.Serializer):
    task_id = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)


class TaskSerializer(serializers.Serializer):
    task_id = serializers.CharField(read_only=True)
    title = serializers.CharField(required=True, max_length=200)
    content = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.DateTimeField(read_only=True)
    deadline = serializers.DateTimeField(required=True)
    updated_at = serializers.DateTimeField(read_only=True)
    status = serializers.ChoiceField(
        choices=Task.STATUS_CHOICES, default='todo')
    priority = serializers.ChoiceField(
        choices=Task.PRIORITY_CHOICES, default='medium')

    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=100),
        write_only=True,
        required=False,
        help_text="Список имён тегов для связи с задачей"
    )

    notes = serializers.SerializerMethodField(read_only=True)
    tags = serializers.SerializerMethodField(read_only=True)
    related_to_tasks = serializers.SerializerMethodField(read_only=True)
    related_from_tasks = serializers.SerializerMethodField(read_only=True)

    group_name = serializers.CharField(
        write_only=True,
        required=True,
        help_text="Название группы, к которой принадлежит задача"
    )

    def validate_deadline(self, value):
        if value <= datetime.datetime.now():
            raise serializers.ValidationError("Дедлайн должен быть в будущем")
        return value

    def validate_tag_names(self, value):
        return [name.lower().strip() for name in value if name.strip()]

    def validate_group_name(self, value):
        from groups.models import Group
        normalized_name = value.lower().strip()

        try:
            group = Group.nodes.get(name=normalized_name)
            if not self.context['request'].user.groups.is_connected(group):
                raise serializers.ValidationError(
                    "Группа не принадлежит пользователю")
            return normalized_name
        except Group.DoesNotExist:
            raise serializers.ValidationError("Группа не найдена")

    def create(self, validated_data):
        from groups.models import Group

        group_name = validated_data.pop('group_name')
        group = Group.nodes.get(name=group_name)

        task = Task(**validated_data)
        task.save()

        group.tasks.connect(task)
        task.group.connect(group)

        self._relations_tags(task, validated_data)

        return task

    def _relations_tags(self, task, validated_data):
        from tags.serializers import TagSerializer

        if 'tag_names' in validated_data:
            for name in validated_data['tag_names']:
                tag = Tag.nodes.get_or_none(name=name)
                if tag is None:
                    serializer = TagSerializer(data={
                        'name': name
                    }, context={
                        'owner': self.context['request'].user
                    })
                    serializer.is_valid(raise_exception=True)
                    tag = serializer.save()
                task.tags.connect(tag)
                tag.tasks.connect(task)

    def update(self, instance, validated_data):
        if 'group_name' in validated_data:
            raise serializers.ValidationError({
                'group_name': ('Changing task group is not allowed.'
                               'Use move-to-group endpoint instead.')
            })

        instance.title = validated_data.get('title', instance.title)
        instance.content = validated_data.get('content', instance.content)
        instance.deadline = validated_data.get('deadline', instance.deadline)
        instance.status = validated_data.get('status', instance.status)
        instance.priority = validated_data.get('priority', instance.priority)

        if 'tag_names' in validated_data:
            self._update_tags(instance, validated_data['tag_names'])

        if 'notes' in validated_data:
            self._update_notes(instance, validated_data['notes'])

        instance.save()
        return instance

    def _update_tags(self, task, tag_names):
        from tags.serializers import TagSerializer

        current_tags = {tag.name for tag in task.tags.all()}
        new_tags = {name.lower().strip() for name in tag_names}

        for tag_name in current_tags - new_tags:
            tag = Tag.nodes.get(name=tag_name)
            task.tags.disconnect(tag)
            tag.tasks.disconnect(task)

        for tag_name in new_tags - current_tags:
            tag = Tag.nodes.get_or_none(name=tag_name)
            if tag is None:
                serializer = TagSerializer(data={
                    'name': tag_name
                }, context={
                    'owner': self.context['request'].user
                })
                serializer.is_valid(raise_exception=True)
                tag = serializer.save()
            task.tags.connect(tag)
            tag.tasks.connect(task)

    def _update_notes(self, task, notes_data):
        current_notes = {note.note_id: note for note in task.notes.all()}

        for note_data in notes_data:
            if 'note_id' in note_data:
                note = Note.nodes.get(note_id=note_data['note_id'])
                note.text = note_data.get('text', note.text)
                note.save()
            else:
                note = Note(text=note_data['text']).save()
                task.notes.connect(note)

        submitted_note_ids = {
            n['note_id'] for n in notes_data if 'note_id' in n}
        for note_id, note in current_notes.items():
            if note_id not in submitted_note_ids:
                note.delete()

    def get_tags(self, obj):
        return [str(tag) for tag in obj.tags.all()]

    def get_related_to_tasks(self, obj):
        return [
            {
                'task_id': task.task_id,
                'title': task.title,
                'status': task.status
            }
            for task in obj.related_to_tasks.all()
        ]

    def get_related_from_tasks(self, obj):
        return [
            {
                'task_id': task.task_id,
                'title': task.title,
                'status': task.status
            }
            for task in obj.related_from_tasks.all()
        ]

    def get_notes(self, obj):
        return [
            {
                'note_id': note.note_id,
                'text': note.text,
                'created_at': note.created_at
            }
            for note in obj.notes.all()
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        group = instance.group.single()
        representation['group'] = {
            'name': group.name if group else None
        }
        return representation
