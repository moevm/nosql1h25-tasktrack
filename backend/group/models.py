class Neo4jRequestGroup:

    def __init__(self, request):
        self.request = request

    def get_only_single(self, **kwargs):
        check_query = """
        MATCH (g:Group {group_name: $group_name})
        RETURN g
        """
        result = self.request(check_query, **kwargs)
        return result.single()

    def create(self, **kwargs):
        create_query = """
        CREATE (g:Group {
            name: $group_name
        })
        RETURN g.name as name
        """
        result = self.request(create_query, **kwargs).single()
        return Neo4jGroup(name=result['name'])


class Neo4jGroup:

    def __init__(self, name):
        self.id = hash(name)
        self.name = name

    def __str__(self):
        return self.name

    @classmethod
    def request(cls, session):
        def func(*args, **kwargs):
            return session.run(*args, **kwargs)
        return Neo4jRequestGroup(func)


class Neo4jRequestUserGroup:

    def __init__(self, request, edge):
        self.request = request
        self.edge = edge

    def save(self):
        create_user_group_query = """
        CREATE (u:User {email: $user_email})-[:Contains]->(g:Group {name: $group_name})
        """
        self.request(create_user_group_query, **self.edge)

        create_group_user_query = """
        CREATE (g:Group {name: $group_name})-[:Belongs]->(u:User {email: $user_email})
        """
        self.request(create_group_user_query, **self.edge)

    def get_groups_contains(self):
        get_query = """
        MATCH (:User {email: $user_email})-[:Contains]->(g:Group)
        RETURN g.name as name
        """
        result = self.request(
            get_query, user_email=self.edge.get('user_email')
        )
        return result.data()


class Neo4jUserGroup:

    def __init__(self, user_email=None, group_name=None):
        self.id = hash(user_email) + hash(group_name)
        self.user_email = user_email
        self.group_name = group_name
        self.edge = {'user_email': user_email, 'group_name': group_name}

    def __str__(self):
        return str(self.edge)

    def request(self, session):
        def func(*args, **kwargs):
            return session.run(*args, **kwargs)
        return Neo4jRequestUserGroup(func, self.edge)
