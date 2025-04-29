from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from .models import Neo4jUser
from .serializers import Neo4jUserSerializer

import jwt
from datetime import datetime, timedelta


def create_jwt_token(user):
    payload = {
        'user_id': str(user.uid),
        'email': user.email,
        'exp': datetime.now() + timedelta(minutes=15),  # 15 минут
        'iat': datetime.now(),
        'token_type': 'access'
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


class RegisterAPIView(APIView):
    def post(self, request):
        serializer = Neo4jUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = create_jwt_token(user)
            return Response({
                'user': serializer.data,
                'token': token
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')

        user = Neo4jUser.nodes.filter(email=email).first()
        if not user or not user.check_password(password):
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token = create_jwt_token(user)
        serializer = Neo4jUserSerializer(user)
        return Response({
            'user': serializer.data,
            'token': token
        })
