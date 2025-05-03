from datetime import datetime
from django.utils import timezone


class TaskFilter:
    @staticmethod
    def _parse_datetime(dt_str):
        try:
            naive_dt = datetime.fromisoformat(dt_str)
            return timezone.make_aware(naive_dt, timezone=timezone.utc)
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
            conditions.append("toLower(t.title) CONTAINS toLower($title)")
            params['title'] = filters['title']

        if 'status' in filters:
            conditions.append("t.status = $status")
            params['status'] = filters['status']

        if 'priority' in filters:
            conditions.append("t.priority = $priority")
            params['priority'] = filters['priority']

        if 'deadline_before' in filters:
            deadline = cls._parse_datetime(filters['deadline_before'])
            if deadline:
                conditions.append("t.deadline <= datetime($deadline_before)")
                params['deadline_before'] = deadline.isoformat()

        if 'deadline_after' in filters:
            deadline = cls._parse_datetime(filters['deadline_after'])
            if deadline:
                conditions.append("t.deadline >= datetime($deadline_after)")
                params['deadline_after'] = deadline.isoformat()

        if 'created_before' in filters:
            created = cls._parse_datetime(filters['created_before'])
            if created:
                conditions.append("t.created_at <= datetime($created_before)")
                params['created_before'] = created.isoformat()

        if 'created_after' in filters:
            created = cls._parse_datetime(filters['created_after'])
            if created:
                conditions.append("t.created_at >= datetime($created_after)")
                params['created_after'] = created.isoformat()

        if 'tag' in filters:
            tag_names = [
                tag.strip().lower()
                for tag in filters['tag'].split(',') if tag.strip()]

            if tag_names:
                if len(tag_names) == 1:
                    conditions.append("""
                    EXISTS {
                        MATCH (t)-[:HAS_TAG]->(tag:Tag)
                        WHERE toLower(tag.name) CONTAINS toLower($tag_name)
                    }
                    """)
                    params['tag_name'] = tag_names[0]
                else:
                    conditions.append("""
                    ALL(tag_name IN $tag_names WHERE
                        EXISTS {
                            MATCH (t)-[:HAS_TAG]->(tag:Tag)
                            WHERE toLower(tag.name) CONTAINS tag_name
                        }
                    )
                    """)
                    params['tag_names'] = tag_names

        if 'group' in filters:
            groups = [
                name.strip() for name in filters['group'].split(',')
                if name.strip()]

            if groups:
                if len(groups) == 1:
                    conditions.append("g.name = $group")
                    params['group'] = groups[0]
                else:
                    conditions.append("g.name IN $group")
                    params['group'] = groups

        if conditions:
            if "WHERE" in query:
                query += " AND " + " AND ".join(conditions)
            else:
                query += " WHERE " + " AND ".join(conditions)

        return query, params
