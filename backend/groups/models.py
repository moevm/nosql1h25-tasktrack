import neomodel


class Group(neomodel.StructuredNode):
    name = neomodel.StringProperty(required=True)
    tasks = neomodel.RelationshipTo('tasks.models.Task', 'CONTAINS_TASK')

    def __str__(self):
        return self.name
