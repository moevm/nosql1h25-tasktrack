from neo4j import GraphDatabase


class Neo4jSessionManager:
    def __init__(self, bolt_url, username, password):
        self._driver = GraphDatabase.driver(
            bolt_url,
            auth=(username, password)
        )

    def __del__(self):
        self._driver.close()

    def get_session(self):
        return Neo4jSession(self._driver.session())


class Neo4jSession:
    def __init__(self, session):
        self._session = session

    def __del__(self):
        self._session.close()

    def run(self, query, **kwargs):
        return self._session.run(query, **kwargs)
