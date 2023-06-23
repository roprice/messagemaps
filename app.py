# Section 1 - imports
# Section 2 - logging
# Section 3 - extract brand name
# Section 4 - provide followup question
# Section 5 - generate strategy



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
import json
import re
from supabase_py import create_client, Client


# Instantiate your Supabase client
url: str = 'https://wogivjshqopegucducyz.supabase.co'
key: str = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZ2l2anNocW9wZWd1Y2R1Y3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg0NzU4MzQsImV4cCI6MTk5NDA1MTgzNH0.zj-QBJknPolKZ6TZ_t3r7aPXbhVB1bf9mmoNBBif9OM'
supabase: Client = create_client(url, key)

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




openai_extractor = ChatOpenAI(model="gpt-3.5-turbo-0613", temperature=0.1)

# Define function description
function_descriptions = [
    {
        "name": "extract_brand_name",
        "description": "Extracts the brand name from a given text",
        "parameters": {
            "type": "object",
            "properties": {
                "brand": {
                    "type": "string",
                    "description": "brand name",
                }
            },
            "required": ["brand"],
        },
    }
]

@app.route("/api/extract", methods=['POST'])
def extract():
    input_text = request.json.get("text")

    # Define the system message
    system_message = SystemMessagePromptTemplate.from_template("You extract brand names from text using the extract_brand_name function.")

    # Define the prompt template
    prompt_template_extractname = PromptTemplate(
       input_variables=["text"],
       template=
       """
       Someone says '{text}'. What brand name can you extract from that statement? Verbose off. Just the brand name.
       """
    )
    extraction_prompt = prompt_template_extractname.format(text=input_text)

    human_message = HumanMessagePromptTemplate.from_template(extraction_prompt)

    messages = ChatPromptTemplate.from_messages([system_message, human_message])

    # Format the prompt
    formatted_prompt = messages.format_prompt().to_messages()

    # Print the formatted prompt
    print("\n")  # This will print a line break.
    print(f"Formatted prompt:{formatted_prompt}")
    print("\n")  # This will print another line break.

    # Generate the response using the model, including function descriptions and automatic function call
    response = openai_extractor(
        messages=formatted_prompt,
        functions=function_descriptions,
        function_call="auto"
    )
    print("\n")  # This will print a line break.
    print(f"response: {response}")
    print("\n")  # This will print a line break.

    # Parse the function call arguments from Langchain-JSON and extract the brand name
    arguments = json.loads(response.additional_kwargs['function_call']['arguments'])
    brand_name = arguments["brand"]

    return jsonify({"brandName": brand_name})






# Section 4 - provide initial followup question
chat = ChatOpenAI(temperature=0.1)

#prompt_template_followup = PromptTemplate(
 #   input_variables=["original_question", "answer"],
  #  template=)

@app.route("/api/followup", methods=['POST'])
def followup():
    question_id = request.json.get("questionId")
    original_question = request.json.get("question")
    answer = request.json.get("answer")
    question_category = request.json.get("questionCategory")
    question_label = request.json.get("questionLabel")
    question_help = request.json.get("questionHelp")
    # Generate a new question using the prompt template
    #formatted_prompt = prompt_template_followup.format_prompt(original_question=original_question, answer=answer)

    # Define the system message
    system_message = SystemMessage(content='''Provide a single question, as in an iterative 5 Why interview''')

    # Define the human message
    human_message = HumanMessage(content=f'''
    The webform's question category was: "{question_category}".
    The webform's question label was: "{question_label}".
    The webform's original question was: "{original_question}".
    The webform's original question response was: "{answer}".
    The webform' help text was: "{question_help}".
    Based on this,  generate a follow-up question that starts with "Why" and reference something specific from the webform's original question response.
    Use the word "you" once and only once.
    Short, single-clause questions only.

    ''')




    # Combine both messages
    messages = [system_message, human_message]

    # Generate the response using the model
    response = chat(messages)

    followup_question = response.content

    return jsonify({"followupQuestion": followup_question, "questionId": question_id})




@app.route("/api/generateStrategy", methods=['POST'])
def generateStrategy():
    interview_id = request.json.get("interviewId")

    # Fetch interview from interviews table
    interview_result = supabase.table('interviews').select('id, brand_name').eq('id', interview_id).execute()
    interview = interview_result['data'][0]

    # Fetch all questions from interview_questions table
    questions_result = supabase.table('interview_questions').select('id, question_label, question_text').execute()

    # Convert list of questions into a dictionary for easy access
    questions = {question['id']: question for question in questions_result['data']}

    # Fetch all answers for the given interview from interview_answers table
    answers_result = supabase.table('interview_answers').select('id, interview_id, question_id, answer, followups').eq('interview_id', interview_id).execute()

    # Iterate through each answer and pair it with its corresponding question
    paired_data = []
    for answer in answers_result['data']:
        question_id = answer['question_id']
        if question_id in questions:
            question = questions[question_id]
            paired_data.append(f"Question: {question['question_label']} - {question['question_text']}\nAnswer: {answer['answer']}\nFollowups: {answer['followups']}\n")

    # Create the prompt string
    prompt = f"For the brand '{interview['brand_name']}', using this interview:\n" + '\n'.join(paired_data) + "please generate a positioning statement for this brand."

    print(prompt)
    return jsonify({"status": "success"})

















#run app
# Run app in debug mode
# app.run(host="localhost", port=8000, debug=True)
# Run app in production mode
#app.run(host="localhost", port=8000)