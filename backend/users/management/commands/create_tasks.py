import json
from django.core.management.base import BaseCommand
from tasks.models import Task
from groups.models import Group
from datetime import datetime

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
            group_name = task_data.get('group_name')
            title = task_data.get('title')
            content = task_data.get('content', '')
            deadline = task_data.get('deadline')
            status = task_data.get('status', 'todo')
            priority = task_data.get('priority', 'medium')

            if not group_name or not title or not deadline:
                self.stdout.write(self.style.WARNING(f'Пропущена задача {title}: недостаточно данных'))
                continue

            try:
                group = Group.nodes.get(name=group_name.lower().strip())
            except Group.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Группа "{group_name}" не найдена'))
                continue

            try:
                deadline_str = task_data.get('deadline')
                deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
                task = Task(
                    title=title,
                    content=content,
                    deadline=deadline,
                    status=status,
                    priority=priority
                )
                task.save()
                group.tasks.connect(task)
                self.stdout.write(self.style.SUCCESS(f'Задача "{title}" успешно создана'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Ошибка при создании задачи "{title}": {str(e)}'))

        self.stdout.write(self.style.SUCCESS('Команда выполнена'))