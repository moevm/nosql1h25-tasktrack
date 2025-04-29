from rest_framework import serializers

from .models import Group


class GroupSerializer(serializers.Serializer):
    name = serializers.CharField(required=True, max_length=100)

    def validate_name(self, value):
        normalized = value.lower().strip()
        user = self.context.get('user', None)
        if user and user.groups.filter(name=normalized):
            raise serializers.ValidationError(
                {"error": "Группа с таким именем уже существует"}
            )
        return normalized

    def create(self, validated_data):
        return Group(**validated_data).save()

    def update(self, instance, validated_data):
        if 'name' in validated_data:
            instance.name = validated_data['name'].lower().strip()
        instance.save()
        return instance
