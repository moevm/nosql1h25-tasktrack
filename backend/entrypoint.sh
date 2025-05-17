#!/bin/sh
python manage.py create_user ./data/users.json
python manage.py create_groups ./data/groups.json
python manage.py create_tags ./data/tags.json
gunicorn --bind 0.0.0.0:8000 task_track.wsgi