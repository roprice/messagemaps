from flask import Flask, request, jsonify
import logging

app = Flask(__name__)

# Create a file handler
file_handler = logging.FileHandler('/var/www/html/app/flask.log')
file_handler.setLevel(logging.DEBUG)

# Create a logging format
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Add the formatter to the handler
file_handler.setFormatter(formatter)

# Add the file handler to the app's logger
app.logger.addHandler(file_handler)


# Create a file handler
file_handler = logging.FileHandler('/var/www/html/app/flask.log')
file_handler.setLevel(logging.DEBUG)

# Create a logging format
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Add the formatter to the handler
file_handler.setFormatter(formatter)

# Add the file handler to the app's logger
app.logger.addHandler(file_handler)

@app.errorhandler(404)
def handle_404(error):  # error is an instance of HTTPException
    app.logger.error(f"Error: {error}, status: {error.code}")
    return 'Resource not found!', 404

@app.errorhandler(500)
def handle_500(error):  # error is an instance of HTTPException
    app.logger.error(f"Error: {error}, status: {error.code}")
    return 'Internal Server Error!', 500



app.logger.info('Flask app logging is set up.')

@app.route('/api/')
def hello_world():
    app.logger.info('Request received to /')
    return 'Hello, Warld!'



@app.route('/api/extract', methods=['POST'])
def extract():
   app.logger.info('Entered extract route handler')
   data = request.get_json()
   text = data.get('text', '')
   brand_name = "Message Maps"
   return jsonify({'message': 'Brand name extracted!', 'brandName': brand_name})




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