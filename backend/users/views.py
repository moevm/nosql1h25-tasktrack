from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from task_track.settings import DRIVER
from .models import Neo4jUser

import re


class EmailPasswordValidator:

    def is_valid_email(self, email):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.fullmatch(pattern, email))

    def is_valid(self, email, password):

        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not self.is_valid_email(email):
            return Response(
                {'error': 'Invalid email format'},
                status=status.HTTP_400_BAD_REQUEST
            )


class RegisterAPIView(APIView, EmailPasswordValidator):

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        self.is_valid(email, password)

        session = DRIVER.get_session()

        result = Neo4jUser.request(session).get_only_single(email=email)
        if result:
            return Response(
                {'error': 'User with this email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Создание пользователя
        try:
            user = Neo4jUser.request(session).create(
                email=email,
                password=make_password(password)
            )

            refresh = RefreshToken.for_user(user)
            refresh['email'] = user.email

            return Response({
                'email': user.email,
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoginAPIView(APIView, EmailPasswordValidator):

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        self.is_valid(email, password)

        session = DRIVER.get_session()

        record = Neo4jUser.request(session).get_only_single(email=email)
        if not record or not check_password(password, record['password']):
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(
            Neo4jUser(email=record['email'])
        )
        refresh['email'] = record['email']

        return Response({
            'email': record['email'],
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        })
