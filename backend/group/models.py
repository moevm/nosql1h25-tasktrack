import neomodel


class Group(neomodel.StructuredNode):
    name = neomodel.StringProperty(required=True)

    def __str__(self):
        return self.name
