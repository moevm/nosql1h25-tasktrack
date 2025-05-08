from rest_framework import serializers

from .models import Tag


class TagSerializer(serializers.Serializer):
    name = serializers.CharField(required=True, max_length=100)
    tasks = serializers.ListField(
        child=serializers.CharField(),
        read_only=True
    )

    def validate_name(self, value):
        normalized = value.lower().strip()
        owner = self.context.get('owner')

        if not owner:
            raise serializers.ValidationError(
                "Владелец тега не указан"
            )

        if owner.tags.filter(name=normalized):
            raise serializers.ValidationError(
                "У вас уже есть тег с таким именем"
            )

        return normalized

    def create(self, validated_data):
        owner = self.context.get('owner')
        if not owner:
            raise serializers.ValidationError(
                {"owner": "Владелец тега не указан"})

        tag = Tag(**validated_data).save()
        owner.tags.connect(tag)
        tag.owner.connect(owner)
        return tag

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)\
            .lower().strip()
        instance.save()
        return instance

    def to_representation(self, instance):
        representation = {
            'name': instance.name,
            'tasks': [task.task_id for task in instance.tasks.all()]
        }
        return representation
