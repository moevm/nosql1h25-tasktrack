from datetime import datetime


class TaskSorter:
    SORT_FIELDS = {
        'title': 'title',
        'created_at': 'created_at',
        'deadline': 'deadline',
        'status': 'status',
        'priority': 'priority'
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
    def sort_queryset(cls, queryset, sort_by, reverse=False):
        """
        Сортировка списка задач в памяти
        :param queryset: Список задач
        :param sort_by: Поле для сортировки
        :param reverse: Обратный порядок
        :return: Отсортированный список
        """
        if not sort_by or sort_by not in cls.SORT_FIELDS:
            return queryset

        field = cls.SORT_FIELDS[sort_by]

        try:
            if field == 'priority':
                return sorted(queryset,
                              key=lambda x: cls.PRIORITY_ORDER.get(
                                  getattr(x, field, '').lower(), -1),
                              reverse=reverse)
            elif field == 'status':
                return sorted(queryset,
                              key=lambda x: cls.STATUS_ORDER.get(
                                  getattr(x, field, '').lower(), -1),
                              reverse=reverse)
            else:
                return sorted(queryset,
                              key=lambda x: getattr(x, field, ''),
                              reverse=reverse)
        except Exception:
            return queryset
