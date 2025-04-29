from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers

from .models import Neo4jUser


class Neo4jUserSerializer(serializers.Serializer):
    uid = serializers.CharField(read_only=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8
    )
    created_at = serializers.DateTimeField(read_only=True)
    modified_at = serializers.DateTimeField(read_only=True)

    def validate_email(self, value):
        value = value.lower().strip()
        if Neo4jUser.nodes.filter(email=value):
            raise serializers.ValidationError(
                "User with this email already exists")
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def create(self, validated_data):
        user = Neo4jUser(email=validated_data['email'])
        user.set_password(validated_data['password'])
        user.save()
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return instance
