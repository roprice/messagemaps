# app.py
from flask import Flask

app = Flask(__name__)

@app.route('/hello')
def hello():
    return 'Hello World!'

@app.route('/extract')
def extract():
    return 'Brand name extracted ok!'


# run with: source env/bin/activate, if no (env)
# then: gunicorn --bind=0.0.0.0:8000 --workers=3 app:app