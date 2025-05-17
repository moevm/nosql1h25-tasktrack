import json
from django.core.management.base import BaseCommand
from tasks.models import Task
from groups.models import Group
from datetime import datetime
from users.models import Neo4jUser


class Command(BaseCommand):
    help = 'Создаёт задачи из JSON-файла'

    def add_arguments(self, parser):
        parser.add_argument(
            'json_file',
            type=str,
            help='Путь к JSON-файлу с данными задач'
        )

    def handle(self, *args, **kwargs):
        json_file_path = kwargs['json_file']

        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                tasks_data = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR('Файл не найден'))
            return
        except json.JSONDecodeError:
            self.stdout.write(self.style.ERROR('Ошибка декодирования JSON'))
            return

        for task_data in tasks_data:
            user_email = task_data.get('user_email')
            group_name = task_data.get('group_name')
            title = task_data.get('title')
            content = task_data.get('content', '')
            deadline = task_data.get('deadline')
            status = task_data.get('status', 'todo')
            priority = task_data.get('priority', 'medium')
            created_at = task_data.get('created_at', datetime.now())
            updated_at = task_data.get('updated_at', datetime.now())
            tags = task_data.get('tags', [])
            notes = task_data.get('notes', [])
            related_to_tasks = task_data.get('related_to_tasks', [])
            related_from_tasks = task_data.get('related_from_tasks', [])
            
            

            if not group_name or not title or not deadline:
                self.stdout.write(self.style.WARNING(f'Пропущена задача {title}: недостаточно данных'))
                continue
            group_name = group_name.lower().strip()
            try:
                user = Neo4jUser.nodes.get(email=user_email)
            except Neo4jUser.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'группа: {group_name}, заголовок: {title} Отсутствует email автора {user_email}!'))
                continue


            try:
                group = user.groups.get(name=group_name)
            except Group.DoesNotExist:
                continue

        
            if not bool(group):
                self.stdout.write(self.style.WARNING(f'группа: {group_name}, отсутствует у {user_email}!'))
                continue

        
            try:
                deadline = datetime.fromisoformat(deadline)
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at)
                if isinstance(updated_at, str):
                    updated_at = datetime.fromisoformat(updated_at)

                existing_tasks = group.tasks.filter(title=title, content=content, deadline=deadline, status=status, priority=priority)
                if bool(existing_tasks):
                    self.stdout.write(self.style.WARNING(f'ТАКАЯ ЗАДАЧА УЖЕ ЕСТЬ!'))
                    continue
                task = Task(
                    title=title,
                    content=content,
                    deadline=deadline,
                    status=status,
                    priority=priority,
                    created_at=created_at,
                    updated_at=updated_at
                )
                task.save()
                group.tasks.connect(task)
                self.stdout.write(self.style.SUCCESS(f'Задача "{title}" успешно создана'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Ошибка при создании задачи "{title}": {str(e)}'))

        self.stdout.write(self.style.SUCCESS('Команда выполнена'))