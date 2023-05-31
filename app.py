from flask import Flask, request, jsonify
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatOpenAI
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

# Init OpenAI for "/api/extract" endpoint
openai = OpenAI(temperature=0.5, max_tokens=300)

# Define the prompt template
prompt_template = PromptTemplate(
    input_variables=["text"],
    template="Extract the brand name out of this text: {text}"
)

@app.route("/api/extract", methods=['POST'])
def predict():
    input_text = request.json.get("text")
    prompt = prompt_template.format(text=input_text)   
    output = openai(prompt)
    output = output.strip()
    return jsonify({"brandName": output})

# Init OpenAI chat model for "/api/stimulate" endpoint
chat = ChatOpenAI(temperature=0.5, max_tokens=300)

# Define the system message template
system_message_template = "You're the company psychologist and a brand strategist. Please review the question asked and the answer provided and ask two additional questions that could improve the question."
system_message_prompt = SystemMessagePromptTemplate.from_template(system_message_template)

# Define the human message template
human_message_template = "Question: {question} Answer: {answer}"
human_message_prompt = HumanMessagePromptTemplate.from_template(human_message_template)

chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt, human_message_prompt])

@app.route("/api/feedback", methods=['POST'])
def stimulate():
    question_id = request.json.get("questionId")
    question = request.json.get("question")
    answer = request.json.get("answer")

    # Generate a new question using the chat model
    messages = chat_prompt.format_prompt(question=question, answer=answer).to_messages()
    ai_message = chat(messages)
    new_question = ai_message.content.strip()

    return jsonify({"newQuestion": new_question, "questionId": question_id})


# Run app
app.run(host="localhost", port=8000, debug=True)
