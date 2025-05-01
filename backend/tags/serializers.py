from rest_framework import serializers

from .models import Tag


class TagSerializer(serializers.Serializer):
    name = serializers.CharField(required=True, max_length=100)

    def validate_name(self, value):
        normalized = value.lower().strip()
        if Tag.nodes.filter(name=normalized):
            raise serializers.ValidationError(
                {"error": "Тэг с таким именем уже существует"}
            )
        return normalized

    def create(self, validated_data):
        return Tag(**validated_data).save()

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)\
            .lower().strip()
        instance.save()
        return instance
