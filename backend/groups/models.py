import neomodel


class Group(neomodel.StructuredNode):
    name = neomodel.StringProperty(required=True)
    tasks = neomodel.RelationshipTo('tasks.models.Task', 'CONTAINS_TASK')

    def __str__(self):
        return self.name

    def delete(self):
        query = """
        MATCH (g:Group {name: $group_name})
        OPTIONAL MATCH (g)-[:CONTAINS_TASK]->(task:Task)
        OPTIONAL MATCH (task)-[:HAS_TAG]->(tag:Tag)
        OPTIONAL MATCH (task)-[:HAS_NOTE]->(note:Note)
        DETACH DELETE note, task, g
        """
        neomodel.db.cypher_query(query, {'group_name': self.name})
