import datetime as dt


class Neo4jRequest:
    def __init__(self, request):
        self.request = request

    def get_only_single(self, **kwargs):
        check_query = """
        MATCH (u:User {email: $email})
        RETURN u.password as password, u.email as email
        """
        result = self.request(check_query, **kwargs)
        return result.single()

    def create(self, **kwargs):
        create_query = """
        CREATE (u:User {
            email: $email,
            password: $password,
            created_at: datetime($created_at),
            modified_at: datetime($modified_at)
        })
        RETURN u.email as email
        """

        now = dt.datetime.now().isoformat()

        result = self.request(
            create_query,
            created_at=now,
            modified_at=now,
            **kwargs
        )

        return Neo4jUser(email=result.single()['email'])


class Neo4jUser:
    def __init__(self, email):
        self.id = hash(email)
        self.email = email

    def __str__(self):
        return self.email

    @classmethod
    def request(cls, session):
        def func(*args, **kwargs):
            return session.run(*args, **kwargs)
        return Neo4jRequest(func)
