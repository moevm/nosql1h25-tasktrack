from datetime import datetime
from django.utils import timezone


class TaskFilter:
    @staticmethod
    def _parse_datetime(dt_str):
        try:
            naive_dt = datetime.fromisoformat(dt_str)
            return naive_dt.astimezone(timezone.utc)
        except (ValueError, TypeError):
            return None

    @classmethod
    def add_filters_to_query(cls, query, params, filters):
        """
        Добавляет условия фильтрации к Cypher-запросу

        :param query: Исходный Cypher-запрос
        :param params: Параметры запроса
        :param filters: Словарь параметров фильтрации
        :return: Модифицированные query и params
        """
        if not filters:
            return query, params

        conditions = []

        if 'title' in filters:
            conditions.append("t.title =~ $title_regex")
            params['title_regex'] = filters['title']

        if 'status' in filters:
            statuses = [
                s.strip() for s in filters['status'].split(',') if s.strip()]
            if statuses:
                if len(statuses) == 1:
                    conditions.append("t.status = $status")
                    params['status'] = statuses[0]
                else:
                    conditions.append("t.status IN $statuses")
                    params['statuses'] = statuses

        if 'priority' in filters:
            priorities = [
                p.strip() for p in filters['priority'].split(',') if p.strip()]
            if priorities:
                if len(priorities) == 1:
                    conditions.append("t.priority = $priority")
                    params['priority'] = priorities[0]
                else:
                    conditions.append("t.priority IN $priorities")
                    params['priorities'] = priorities

        if 'deadline_before' in filters:
            deadline = cls._parse_datetime(filters['deadline_before'])
            if deadline:
                conditions.append("t.deadline <= $deadline_before")
                params['deadline_before'] = deadline.timestamp()

        if 'deadline_after' in filters:
            deadline = cls._parse_datetime(filters['deadline_after'])
            if deadline:
                conditions.append("t.deadline >= $deadline_after")
                params['deadline_after'] = deadline.timestamp()

        if 'created_before' in filters:
            created = cls._parse_datetime(filters['created_before'])
            if created:
                conditions.append("t.created_at <= $created_before")
                params['created_before'] = created.timestamp()

        if 'created_after' in filters:
            created = cls._parse_datetime(filters['created_after'])
            if created:
                conditions.append("t.created_at >= $created_after")
                params['created_after'] = created.timestamp()

        if 'tag' in filters:
            tag_names = [
                tag.strip().lower()
                for tag in filters['tag'].split(',') if tag.strip()
            ]

            if tag_names:
                if len(tag_names) == 1:
                    conditions.append("""
                    EXISTS {
                        MATCH (t)-[:HAS_TAG]->(tag:Tag)
                        WHERE tag.name =~ $tag_regex
                    }
                    """)
                    params['tag_regex'] = tag_names[0]
                else:
                    conditions.append("""
                    ALL(tag_regex IN $tag_regexes WHERE
                        EXISTS {
                            MATCH (t)-[:HAS_TAG]->(tag:Tag)
                            WHERE tag.name =~ tag_regex
                        }
                    )
                    """)
                    params['tag_regexes'] = tag_names

        if 'group' in filters:
            groups = [
                name.strip() for name in filters['group'].split(',')
                if name.strip()
            ]

            if groups:
                if len(groups) == 1:
                    conditions.append("g.name =~ $group_regex")
                    params['group_regex'] = groups[0]
                else:
                    conditions.append(
                        "ANY(regex IN $group_regexes WHERE g.name =~ regex)")
                    params['group_regexes'] = groups

        if conditions:
            if "WHERE" in query:
                query += " AND " + " AND ".join(conditions)
            else:
                query += " WHERE " + " AND ".join(conditions)

        return query, params
