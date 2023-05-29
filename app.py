from flask import Flask, request, jsonify
import logging  # Import the logging module

app = Flask(__name__)

print(app.debug)


if not app.debug:
    # Create a file handler
    file_handler = logging.FileHandler('flask.log')
    file_handler.setLevel(logging.DEBUG)

    # Create a logging format
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)

    # Add the handlers to the logger
    app.logger.addHandler(file_handler)

    app.logger.info('Flask application logging is set up.')


@app.route('/app/api/hello')
def hello():
    return 'Hello World!'

@app.route('/app/api/extract', methods=['POST'])
def extract():
    data = request.get_json() # parse as JSON
    text = data.get('text', '') # get text from POST request
    print(text)  # do something with text
    return jsonify({'message': 'Brand name extracted!'}) #  return JSON response

if __name__ == "__main__":
    app.run(host='localhost', port=8000, debug=True)


# before running the server, turn on virtual environment:
# source env/bin/activate, if no (env)
#
# then for flask (development mode), run:
# export FLASK_ENV=development
# python3 app.py
# (toggle debug=-True for autoreloading and debugging)
#
# then for production mode, run:
# gunicorn --bind=localhost:8000 --workers=5 app:app
# OR
# gunicorn --bind=localhost:8000 --workers=5 --reload app:app (for auto reloading)