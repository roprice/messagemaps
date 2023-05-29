from flask import Flask

app = Flask(__name__)

@app.route('/hello')
def hello():
    return 'Hello World!'

@app.route('/extract')
def extract():
    return 'Brand name extracted!'

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

# before running the server, turn on virtual environment:
# source env/bin/activate, if no (env)
#
# then for flask (development mode), run:
# python3 app.py
# (include debug=-True for autoreloading and debugging)
#
# then for production mode, run:
# gunicorn --bind=0.0.0.0:8000 --workers=5 app:app
# OR gunicorn --bind=0.0.0.0:8000 --workers=3 --reload app:app (for auto reloading)



