#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
pip install gunicorn
cd mysite2026
python manage.py collectstatic --noinput
python manage.py migrate