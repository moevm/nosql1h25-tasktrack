class TaskSorter:
    """
    Класс для сортировки задач через Neo4j ORM (neomodel)
    """
    SORT_FIELDS_MAPPING = {
        'title': 't.title',
        'created_at': 't.created_at',
        'updated_at': 't.updated_at',
        'deadline': 't.deadline',
        'status': 't.status',
        'priority': 't.priority'
    }

    PRIORITY_ORDER = {
        'low': 0,
        'medium': 1,
        'high': 2,
        'critical': 3
    }

    STATUS_ORDER = {
        'todo': 0,
        'in_progress': 1,
        'done': 2,
        'archived': 3
    }

    @classmethod
    def add_sorting_to_query(cls, query, params,
                             sort_params, reverse_params=None):
        """
        Добавляет сортировку к Cypher-запросу по нескольким параметрам

        :param query: Исходный Cypher-запрос
        :param params: Параметры запроса
        :param sort_params: Строка с параметрами сортировки через запятую (например, "priority,created_at")
        :param reverse_params: Строка с параметрами обратной сортировки через запятую (например, "true,false")
        :return: Модифицированный запрос и параметры
        """
        if not sort_params:
            query += " RETURN t"
            return query, params

        sort_fields = [s.strip() for s in sort_params.split(',')]
        if reverse_params:
            reverse_flags = [
                r.strip().lower() == 'true' for r in reverse_params.split(',')]
        else:
            reverse_flags = [False] * len(sort_fields)

        reverse_flags += [False] * (len(sort_fields) - len(reverse_flags))

        order_parts = []
        with_parts = []

        for i, (sort_by, reverse) in enumerate(zip(sort_fields, reverse_flags)):
            sort_field = cls.SORT_FIELDS_MAPPING.get(sort_by)
            if not sort_field:
                continue

            order = 'DESC' if reverse else 'ASC'

            if sort_by == 'priority':
                alias = f'priority_order_{i}'
                case_parts = [f"WHEN t.priority = '{p}' THEN {v}"
                              for p, v in cls.PRIORITY_ORDER.items()]
                with_parts.append(
                    f"CASE {' '.join(case_parts)} ELSE 99 END AS {alias}")
                order_parts.append(f"{alias} {order}")
            elif sort_by == 'status':
                alias = f'status_order_{i}'
                case_parts = [f"WHEN t.status = '{s}' THEN {v}"
                              for s, v in cls.STATUS_ORDER.items()]
                with_parts.append(
                    f"CASE {' '.join(case_parts)} ELSE 99 END AS {alias}")
                order_parts.append(f"{alias} {order}")
            else:
                order_parts.append(f"{sort_field} {order}")

        if not order_parts:
            query += " RETURN t"
            return query, params

        if with_parts:
            query += f" WITH t, {', '.join(with_parts)}"
        query += f" RETURN t ORDER BY {', '.join(order_parts)}"

        return query, params
