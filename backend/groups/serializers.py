from rest_framework import serializers
from .models import Group
from tasks.serializers import ReadTaskSerializer


class GroupSerializer(serializers.Serializer):
    name = serializers.CharField(required=True, max_length=100)
    tasks = ReadTaskSerializer(
        many=True,
        read_only=True
    )

    def validate_name(self, value):
        normalized = value.lower().strip()
        user = self.context.get('user')

        if user and user.groups.filter(name=normalized):
            raise serializers.ValidationError(
                "Группа с таким именем уже существует у пользователя"
            )
        return normalized

    def create(self, validated_data):
        return Group(**validated_data).save()

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)\
            .lower().strip()
        instance.save()
        return instance
