from rest_framework import serializers

from .models import TaskHistory


class TaskHistorySerializer(serializers.Serializer):
    changed_at = serializers.DateTimeField(read_only=True)
    changed_field = serializers.ChoiceField(
        choices=TaskHistory.get_fields(),
        required=True
    )
    value = serializers.CharField(allow_null=True)
    change_type = serializers.ChoiceField(
        choices=list(TaskHistory.TYPE_CHOICES.keys()),
        read_only=True
    )

    def create(self, validated_data):
        task = validated_data.pop('task', None)
        history_entry = TaskHistory(**validated_data)
        history_entry.save()

        if task:
            history_entry.task.connect(task)

        return history_entry

    def update(self, instance, validated_data):
        raise serializers.ValidationError(
            "History entries are immutable and cannot be updated."
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['change_type_display'] = instance.change_type
        return data
