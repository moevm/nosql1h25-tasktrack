import json
from django.core.management.base import BaseCommand
from users.models import Neo4jUser


class Command(BaseCommand):
    help = 'Create users from JSON file'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='Path to JSON file with user data')

    def handle(self, *args, **options):
        json_path = options['json_file']

        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                users_data = json.load(f)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Failed to load JSON file: {e}"))
            return

        if not isinstance(users_data, list):
            self.stderr.write(self.style.ERROR("JSON must be a list of user objects"))
            return

        created = 0
        skipped = 0

        for data in users_data:
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')

            if not email or not password:
                self.stderr.write(self.style.WARNING(f"Skipping invalid user data: {data}"))
                skipped += 1
                continue

            user = Neo4jUser(email=email)
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created user '{email}'"))
            created += 1

        self.stdout.write(self.style.SUCCESS(f"Done. Created: {created}, Skipped: {skipped}"))
