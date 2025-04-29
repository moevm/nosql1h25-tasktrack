from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import jwt

from .models import Neo4jUser


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
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=['HS256'])
            session = settings.DRIVER.get_session()

            query = """
            MATCH (u)
            WHERE u.email = $email
            RETURN u.email as email
            """
            result = session.run(
                query,
                email=payload['email']
            )
            user_data = result.single()

            if not user_data:
                raise AuthenticationFailed('User not found')

            return (Neo4jUser(email=user_data['email']), None)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')


def available_for_authorized(view_cls):
    view_cls.authentication_classes = [Neo4jJWTAuthentication]
    view_cls.permission_classes = []
    return view_cls
