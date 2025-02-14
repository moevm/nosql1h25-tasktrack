import os
from neo4j import GraphDatabase
from dotenv import load_dotenv


class Neo4jDatabase:
    def __init__(self, uri, username, password):
        self.driver = GraphDatabase.driver(uri, auth=(username, password))

    def close(self):
        if self.driver:
            self.driver.close()

    def __del__(self):
        self.close()

    def create_post(self, title, text, author):
        with self.driver.session() as session:
            return session.write_transaction(
                self._create_post_tx,
                title,
                text,
                author
            )
        
    def create_relation(self, post_id_one, post_id_two, relation_name):
        with self.driver.session() as session:
            session.write_transaction(
                self._create_relation_tx,
                post_id_one,
                post_id_two,
                relation_name
            )

    @staticmethod
    def _create_post_tx(tx, title, text, author):
        query = """
        CREATE (p:Post {title: $title, text: $text, author: $author}) 
        RETURN id(p) AS id
        """
        result = tx.run(query, title=title, text=text, author=author)
        return result.single()['id']

    @staticmethod
    def _create_relation_tx(tx, post_id_one, post_id_two, relation_name):
        query = f"""
        MATCH (p1: Post), (p2: Post)
        WHERE id(p1) = $post_id_one AND id(p2) = $post_id_two
        CREATE (p1)-[:`{relation_name}`]->(p2)
        """
        tx.run(
            query,
            post_id_one=post_id_one,
            post_id_two=post_id_two,
            relation_name=relation_name
        )


def main():
    load_dotenv()
    uri = f'neo4j://localhost:{os.getenv("PORT", "7687")}'
    username = os.getenv('NEO4J_USER', 'neo4j')
    password = os.getenv('PASSWORD')
    database = Neo4jDatabase(uri, username, password)
    post1 = database.create_post("test1", 'test1', 'test1')
    post2 = database.create_post("test2", 'test2', 'test2')
    database.create_relation(post1, post2, 'TEEEST')
    print("Подключение к Neo4j установлено!")
    database.close()


if __name__ == '__main__':
    main()
