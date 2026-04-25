#!/usr/bin/env bash
set -e

gunicorn config.wsgi:application
