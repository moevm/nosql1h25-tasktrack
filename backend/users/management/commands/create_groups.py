import json
from django.core.management.base import BaseCommand
from users.models import Neo4jUser
from groups.models import Group


class Command(BaseCommand):
    help = 'Create groups for users from JSON file'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='Path to JSON file')

    def handle(self, *args, **options):
        file_path = options['json_file']

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                groups_data = json.load(f)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error loading JSON: {e}"))
            return

        if not isinstance(groups_data, list):
            self.stderr.write(self.style.ERROR("JSON must be a list of groups"))
            return

        created, skipped = 0, 0

        for entry in groups_data:
            email = entry.get('email')
            group_name = entry.get('group_name')


            if not email or not group_name:
                self.stderr.write(self.style.WARNING(f"Invalid entry: {entry}"))
                skipped += 1
                continue

            try:
                user = Neo4jUser.nodes.get(email=email)
            except Neo4jUser.DoesNotExist:
                self.stderr.write(self.style.WARNING(f"User not found: {email}"))
                skipped += 1
                continue
            
            normalized_name = group_name.strip().lower()
            
            if bool(user.groups.filter(name=normalized_name)):
                continue

            group = Group(name=normalized_name).save()
            user.groups.connect(group)

            self.stdout.write(self.style.SUCCESS(f"Group '{group_name}' created for user {email}"))
            created += 1

        self.stdout.write(self.style.SUCCESS(f"Done. Created: {created}, Skipped: {skipped}"))
