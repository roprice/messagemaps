# app.py
from flask import Flask

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)

@app.route('/hello')
def hello():
    return 'Hello World!'

@app.route('/extract')
def extract():
    return 'Brand name extracted ok!'


# before running the server, turn on virtual environment:
# source env/bin/activate, if no (env)
#
# then for flask (development mode), run:
# python3 app.py
#
# then for production mode, run:
# gunicorn --bind=0.0.0.0:8000 --workers=5 app:app