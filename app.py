# Section 1 - imports
# Section 2 - logging
# Section 3 - extract brand name
# Section 4 - provide followup question
# Section 5 - run app



# Section 1 - imports
from flask import Flask, request, jsonify
from langchain.chat_models import ChatOpenAI
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
import os
import logging



# Set OpenAI API key
os.environ["OPENAI_API_KEY"] = "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"

app = Flask(__name__)


# Section 2 - logging
## START ERROR LOGGING SECTION

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
## END ERROR LOGGING SECTION



# Section 3 - extract brand name
# Init OpenAI for "/api/extract" endpoint
openai = OpenAI(temperature=0.2, max_tokens=300)

# Define the prompt template
prompt_template_extractname = PromptTemplate(
    input_variables=["text"],
    template="To kick off an interview, the interviewee has been asked 'What's the name of the brand I'm interviewing you about?' This is their response: '{text}'.  Now - please extract the brand name out of this response and tell me what it is. Don't say anything but the brand name. Verbose mode off."
)

@app.route("/api/extract", methods=['POST'])
def predict():
    input_text = request.json.get("text")
    extract_prompt = prompt_template_extractname.format(text=input_text)   
    output = openai(extract_prompt)
    output = output.strip()
    return jsonify({"brandName": output})





# Section 4 - provide followup question
chat = ChatOpenAI(temperature=0)

#prompt_template_followup = PromptTemplate(
 #   input_variables=["original_question", "answer"],
  #  template=)

@app.route("/api/followup", methods=['POST'])
def followup():
    question_id = request.json.get("questionId")
    original_question = request.json.get("question")
    answer = request.json.get("answer")

    # Generate a new question using the prompt template
    #formatted_prompt = prompt_template_followup.format_prompt(original_question=original_question, answer=answer)
    
    # Define the system message 
    system_message = SystemMessage(content='''Provide a single question, as in an iterative 5 Why interview''')
    
    # Define the human message
    human_message = HumanMessage(content=f'''
    The original question was: "{original_question}"
    The response to that question was: "{answer}"
    Based on this, please generate a follow-up question that starts with "Why" and asks about something specific from the response.
    ''')

    
    # Combine both messages
    messages = [system_message, human_message]

    # Generate the response using the model
    response = chat(messages)
    
    followup_question = response.content

    return jsonify({"followupQuestion": followup_question, "questionId": question_id})



# Section 5 - run app
# Run app in debug mode
app.run(host="localhost", port=8000, debug=True)
# Run app in production mode
#app.run(host="localhost", port=8000)





