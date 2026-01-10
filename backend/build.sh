#!/usr/bin/env bash
# exit on error
set -o errexit

pip install --upgrade pip
pip install "setuptools<70.0.0"
pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
