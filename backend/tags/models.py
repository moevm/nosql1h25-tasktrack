import neomodel


class Tag(neomodel.StructuredNode):
    name = neomodel.StringProperty(required=True, index=True)
    owner = neomodel.RelationshipFrom('users.models.Neo4jUser', 'OWNS_TAG')
    tasks = neomodel.RelationshipFrom('tasks.models.Task', 'HAS_TAG')

    def __str__(self):
        return self.name

    def delete(self):
        """Удаляет тег и все его связи одним Cypher-запросом"""
        query = """
        MATCH (t:Tag)-[r]-(any)
        WHERE t.name = $name
        DELETE r, t
        """
        neomodel.db.cypher_query(query, {'name': self.name})
