from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings

from .models import Neo4jUser

import jwt


class Neo4jJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            raise AuthenticationFailed(
                detail='Invalid authorization header. Expected: "Bearer <token>"',
                code='bad_authorization_header'
            )

        token = auth_header.split(' ')[1]

        try:
            # Декодирование JWT
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=['HS256'])

            if 'email' not in payload:
                raise AuthenticationFailed('Invalid token structure')

            user = Neo4jUser.nodes.filter(email=payload['email']).first()

            if not user:
                raise AuthenticationFailed('User not found')

            return (user, None)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
            raise AuthenticationFailed(str(e))


def available_for_authorized(view_cls):
    view_cls.authentication_classes = [Neo4jJWTAuthentication]
    view_cls.permission_classes = []
    return view_cls
