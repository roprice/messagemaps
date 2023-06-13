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
openai_extractor = OpenAI(temperature=0.1, max_tokens=300)

# Define the prompt template
prompt_template_extractname = PromptTemplate(
    input_variables=["text"],
    template="""To kick off an interview, the interviewee has been asked 'What's the name of the brand I'm interviewing you about?' This is their response: '{text}'.  Now - please extract the brand name out of this response and tell me what it is. Don't say anything but the brand name. Verbose mode off."""  
)

@app.route("/api/extract", methods=['POST'])
def predict():
    input_text = request.json.get("text")
    extraction_prompt = prompt_template_extractname.format(text=input_text)  
    print (f"Final Prompt: {extraction_prompt}")  
    output = openai_extractor(extraction_prompt)
    output = output.strip()
    return jsonify({"brandName": output})








# Section 4 - provide initial followup question
chat = ChatOpenAI(temperature=0.2)

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
    Never use the word "you" more than once in a question.
    Single-clause questions only.
    ''')

    
    # Combine both messages
    messages = [system_message, human_message]

    # Generate the response using the model
    response = chat(messages)
    
    followup_question = response.content

    return jsonify({"followupQuestion": followup_question, "questionId": question_id})





# Section 5 - provide  followup question 2

#@app.route("/api/followup_answer", methods=['POST'])
#def followup_answer():
  #  question_id = request.json.get("questionId")
  #  original_question = request.json.get("question")
  #  answer = request.json.get("answer")
  #  followup_question1 = request.json.get("followupQuestion1")
  #  followup_answer1 = request.json.get("followupQuestion1")

    # Define the system message
   # system_message = SystemMessage(content='''Provide a single question, as in an iterative 5 Why interview''')
    
    # Define the human message
 #   human_message = HumanMessage(content=f'''
 #   The original question was: "{original_question}"
 #   The response to that question was: "{answer}"
 #   The follow-up question was: "{followup_question_1}"
 #   The response to that question was "{followup_answer_1}"
 #   Based on this, please generate a next follow-up question that starts with "Why" and asks about something specific from the response.
 #   Never use the word "you" more than once in a question.
  #  Single-clause questions only.
  #  ''')

    # Combine both messages
  #  messages = [system_message, human_message]

    # Generate the response using the model
   # response = chat(messages)
    
  #  next_followup_question = response.content

  # return jsonify({"followupQuestion2": next_followup_question, "questionId": question_id})


# Stratregy
#Transcription and Note Review: The first step is to transcribe and review all notes taken during the interview. If the interviews were recorded, it's useful to transcribe them so that no information is lost or misunderstood.

#Identification of Key Points: The next step involves identifying the key points that were brought up during the interviews. This could be significant challenges the company is facing, potential opportunities, key strengths and weaknesses, as well as other relevant topics.

#Thematic Analysis: Organize the key points into common themes. For example, a theme could be internal communication, customer retention, or product development. This makes it easier to summarize and present the information later on.

#Cross-Verification: Cross-verify the identified themes with other data sources, if available. This could be other interviews, data from the company, or even third-party research. This helps to validate the themes and ensure they're not based on one-off comments.

#SWOT Analysis: One way to analyze the information is by conducting a SWOT analysis - identifying the company's Strengths, Weaknesses, Opportunities, and Threats based on the interview data. This can provide a quick snapshot of the current situation of the company.

#Gap Analysis: Determine the gap between the current state of the company and where it wants to be. This gives insight into the areas that need focus.

#Stakeholder Analysis: Understand the interests and influence of different stakeholders within the company. This will provide context for some of the responses and help identify potential roadblocks or allies when implementing the strategy.

#Problem Statement Definition: Based on the analysis, define the primary problem(s) that need to be solved. This helps to focus the strategy on what matters most to the company.

#Visualize Data: If possible, visualize the data in a way that makes it easier to understand the overall picture. This could be a diagram, a flowchart, a graph, or any other visual representation that makes the information more digestible.









# Section 5 - run app
# Run app in debug mode
app.run(host="localhost", port=8000, debug=True)
# Run app in production mode
#app.run(host="localhost", port=8000)





