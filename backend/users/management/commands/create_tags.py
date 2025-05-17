import json
from django.core.management.base import BaseCommand, CommandError
from users.models import Neo4jUser
from tags.models import Tag


class Command(BaseCommand):
    help = 'Создаёт теги из JSON-файла'

    def add_arguments(self, parser):
        parser.add_argument('json_path', type=str, help='Путь до JSON-файла с тегами')

    def handle(self, *args, **options):
        json_path = options['json_path']

        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                tags_data = json.load(f)
        except Exception as e:
            raise CommandError(f'Ошибка при чтении файла: {e}')
        for entry in tags_data:
            try:
                email = entry.get('email')
                name = entry.get('name').lower().strip()
                user = Neo4jUser.nodes.get(email=email)
                if bool(user.tags.filter(name=name)):
                    self.stdout.write(self.style.SUCCESS(f"!Тег '{name}' пропущен!"))
                    continue
                tag = Tag(name=name).save()
                user.tags.connect(tag)
                self.stdout.write(self.style.SUCCESS(f"✔ Тег '{entry['name']}' создан для {entry['email']}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"✘ Ошибка при создании тега для {entry.get('email')}: {e}"))


