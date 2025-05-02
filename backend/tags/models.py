import neomodel


class Tag(neomodel.StructuredNode):
    name = neomodel.StringProperty(required=True, unique_index=True)

    def __str__(self):
        return self.name
