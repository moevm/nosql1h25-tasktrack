from django.contrib.auth.hashers import make_password, check_password

import neomodel

import datetime as dt


class Neo4jUser(neomodel.StructuredNode):
    email = neomodel.StringProperty(required=True, unique_index=True)
    password_hash = neomodel.StringProperty(required=True)
    created_at = neomodel.DateTimeProperty(default=dt.datetime.now)
    modified_at = neomodel.DateTimeProperty(default=dt.datetime.now)
    groups = neomodel.RelationshipTo('groups.models.Group', 'OWNS_GROUP')

    def set_password(self, password):
        self.password_hash = make_password(password)

    def check_password(self, password):
        return check_password(password, self.password_hash)

    def save(self, *args, **kwargs):
        self.modified_at = dt.datetime.now()
        return super().save(*args, **kwargs)
