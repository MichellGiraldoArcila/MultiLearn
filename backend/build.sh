#!/usr/bin/env bash
set -e

pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m spacy download es_core_news_sm
python manage.py collectstatic --noinput
python manage.py migrate
