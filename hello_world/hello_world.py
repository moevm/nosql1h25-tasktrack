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

    def find_posts(self, **kwargs):
        valid_keys = {'title', 'author', 'id'}
        if not valid_keys.intersection(kwargs.keys()) and len(kwargs):
            return 'Некорректные параметры'
        with self.driver.session() as session:
            return session.read_transaction(self.__find_posts_tx, **kwargs)
        

    @staticmethod
    def __find_posts_tx(tx, **kwargs):
        query = 'MATCH (n:Post) '
        if kwargs:
            query += 'WHERE '
        find_params = list()
        if 'id' in kwargs:
            find_params.append(f'id(n)=$id')
        if 'author' in kwargs:
            find_params.append(f'n.author=$author')
        if 'title' in kwargs:
            find_params.append(f'n.title=$title')
        query += ' AND '.join(find_params)
        query += ' RETURN n'
        result = tx.run(query, **kwargs)
        return [record['n'] for record in result] 

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


def id_node(node):
    return node.element_id.split(':')[2]


TEST_DATA_POSTS = (
    ('Пост о природе', 'Много информации о природе', 'Василий'),
    ('Рецепт здорового питания', 'Как готовить вкусно и полезно', 'Елена'),
    ('Технологии будущего', 'Как AI меняет мир', 'Иван'),
    ('Путеводитель по Токио', 'Лучшие места для посещения в Токио', 'Алексей'),
    ('Советы по саморазвитию', 'Как стать лучшей версией себя', 'Мария'),
    ('Как стать успешным в бизнесе', 'Шаги для начинающего предпринимателя', 'Дмитрий'),
    ('Спортивные тренировки для начинающих', 'Как начать тренироваться без травм', 'Светлана'),
    ('Финансовая грамотность', 'Как управлять своими деньгами', 'Ольга'),
    ('Психология межличностных отношений', 'Как строить здоровые отношения', 'Никита'),
    ('Путеводитель по Парижу', 'Топ-10 мест для посещения в Париже', 'Василий')
)


TEST_FIND_POSTS = (
    {},
    {'author': 'Василий'},
    {'id': 1},
    {'title': 'Рецепт здорового питания'},
    {'author': 'Василий', 'title': 'Путеводитель по Парижу'},
)


TEST_RELATION_POSTS = (
    (1, 2, 'one-to-two'),
    (1, 3, 'one-to-three'),
    (3, 4, 'three-to-four')
)


def main():
    load_dotenv()
    uri = f'neo4j://localhost:{os.getenv("NEO4J_PORT", "7687")}'
    username = os.getenv('NEO4J_USER', 'neo4j')
    password = os.getenv('NEO4J_PASSWORD')
    database = Neo4jDatabase(uri, username, password)
    for post in TEST_DATA_POSTS:
        database.create_post(*post)

    for find_params in TEST_FIND_POSTS:
        nodes = database.find_posts(**find_params)
        for node in nodes:
            print(f"Title: {node['title']}, Text: {node['text']}, Author: {node['author']}")

    for relation in TEST_RELATION_POSTS:
        database.create_relation(*relation)

    database.close()


if __name__ == '__main__':
    main()
