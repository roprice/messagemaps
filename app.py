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
import traceback


# Instantiate your Supabase client
url: str = 'https://wogivjshqopegucducyz.supabase.co'
key: str = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZ2l2anNocW9wZWd1Y2R1Y3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg0NzU4MzQsImV4cCI6MTk5NDA1MTgzNH0.zj-QBJknPolKZ6TZ_t3r7aPXbhVB1bf9mmoNBBif9OM'
supabase: Client = create_client(url, key)

# Set OpenAI API key
os.environ["OPENAI_API_KEY"] = "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"


app = Flask(__name__)


# Section 2 - logging
## START ERROR LOGGING SECTION


@app.errorhandler(500)
def server_error(e):
    # Log the error and stacktrace.
    print(f'Server error: {e}, stacktrace: {traceback.format_exc()}')
    return 'An internal error occurred.', 500
    

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




chat_35_functions_01 = ChatOpenAI(model="gpt-3.5-turbo-0613", temperature=0.1)

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
    response = chat_35_functions_01(
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
chat_01 = ChatOpenAI(temperature=0.1)

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
    response = chat_01(messages)

    followup_question = response.content

    return jsonify({"followupQuestion": followup_question, "questionId": question_id})


os.environ["OPENAI_API_KEY"] = "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"

openaikey="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"

chat_GPT35_10_16k_functions = ChatOpenAI(temperature=1.0, model_name="gpt-3.5-turbo-16k-0613", openai_api_key=openaikey)
chat_GPT35_07_16k_functions = ChatOpenAI(temperature=0.7, model_name="gpt-3.5-turbo-16k-0613", openai_api_key=openaikey)
chat_GPT35_04_16k_functions = ChatOpenAI(temperature=0.4, model_name="gpt-3.5-turbo-16k-0613", openai_api_key=openaikey)
chat_GPT35_04_16k_functions = ChatOpenAI(temperature=0.1, model_name="gpt-3.5-turbo-16k-0613", openai_api_key=openaikey)


chat_GPT40_09 = ChatOpenAI(temperature=0.9, model_name="gpt-4", openai_api_key=openaikey)
chat_GPT40_06 = ChatOpenAI(temperature=0.6, model_name="gpt-4", openai_api_key=openaikey)
chat_GPT40_03 = ChatOpenAI(temperature=0.2, model_name="gpt-4", openai_api_key=openaikey)
chat_GPT40_01 = ChatOpenAI(temperature=0.1, model_name="gpt-4", openai_api_key=openaikey)


chat_GPT40_09_32k = ChatOpenAI(temperature=0.9, model_name="gpt-4-32k", openai_api_key=openaikey)
chat_GPT40_06_32k = ChatOpenAI(temperature=0.6, model_name="gpt-4-32k", openai_api_key=openaikey)
chat_GPT40_03_32k = ChatOpenAI(temperature=0.2, model_name="gpt-4-32k", openai_api_key=openaikey)
chat_GPT40_01_32k = ChatOpenAI(temperature=0.1, model_name="gpt-4-32k", openai_api_key=openaikey)

# suspected larger context window
chat_GPT40_09_functions = ChatOpenAI(temperature=0.9, model_name="gpt-4-0613", openai_api_key=openaikey)
chat_GPT40_06_functions = ChatOpenAI(temperature=0.6, model_name="gpt-4-0613", openai_api_key=openaikey)
chat_GPT40_02_functions = ChatOpenAI(temperature=0.2, model_name="gpt-4-0613", openai_api_key=openaikey)
chat_GPT40_01_functions = ChatOpenAI(temperature=0.1, model_name="gpt-4-0613", openai_api_key=openaikey)



# Additional function to generate buyer profiles
def buyer_profiles_from_openai(interview_transcript):
    buyer_profiles_prompt_template = ''' 
        Based on the interview with the company CEO: {interview_transcript}, identify and describe potential individual buyers.
    '''
    formatted_prompt = buyer_profiles_prompt_template.format(interview_transcript=interview_transcript)
    system_message = SystemMessage(content="You are a market analyst.")
    user_message = HumanMessage(content=formatted_prompt)
    response = chat_GPT35_04_16k_functions([system_message, user_message])
    
    # Extract and return the list of profiles from the AI response
    # You would need to adjust this depending on how your model returns structured data
    profiles = response.content.split('\n')
    return json.dumps(profiles)  # Convert list to JSON string for storing in the database
    
    




def best_positioning(positioning_statement_options, interview_transcript):
    
    
    positioning_statement_guidelines = "positions the brand against competition in a specific way, is concise, includes problem-solution clause, articulates a unique value proposition, uses clear and non-promotional language, defines or alludes to the target audience adn their need(s), and is neutral, straightforward, and not overly promotional, avoiding superlatives and exagerations, such as entirely, only, best, leading, etc."
    
    # Construct the message content
    message_content = f"I need a number from you. Here are five positioning strategies for a B2B tech firm: {positioning_statement_options}. Each strategy has been numbered from 1 to 5. Based on these criteria: {positioning_statement_guidelines}, please exercise a process of elimination and choose the best strategy. Respond with a single dsgit corresponding to the best strategy, i.e., 1, 2, 3, 4, or 5."


    # Create a system message to set the assistant's role
    system_message = SystemMessage(content="You are an investor at a PE form in the B2B tech space and trying to decide whether to purchase this company.")

    # Create a user message with the message content
    user_message = HumanMessage(content=message_content)

    # Call the chat model with a list of messages
    response = chat_GPT40_01([system_message, user_message])

    response_text = response.content  # This is a string.
    
    print(f"best positioning statement number: {response_text}")

    # Find the first integer in the response using a regular expression.
    match = re.search(r'\d', response_text)
    if match:
        # If an integer was found, convert it to an integer type.
        # Subtract 1 if you're using 1-based indices.
        best_option = int(match.group()) - 1
    else:
        # If no integer was found, use 2 as the default choice.
        best_option = 2
    
    return best_option

def positioning_strategy_from_openai(interview_transcript):

    positioning_prompt_templates = [
        "You are a Gartner analyst in the B2B tech space. Please review your interview with a company CEO: {interview_transcript}. Using clear, concise, and direct language, write down the company's positioning strategy. 3-5 short sentences. Don't use buzzwords that are exagerated, vague, annoying or overly used. Speak as a neutral 3rd-party; don't use these words: our, we, us.  Be straightfoward: don't say: despite, however, in spite of, etc.  Don't use superlatives such as only, best, most, or entirely.",
        
        "As a seasoned B2B tech analyst at Gartner, you've just finished your interview with a tech CEO. Here's what they shared: {interview_transcript}. In 3-5 sentences, articulate the company's position in the marketplace using simple, shortswords. Contextualize its positioning with how the market is changing.  Don't use buzzwords that are known for exageration, vagueness, being annoying or being overly-used. Speak as a neutral 3rd-party; don't use these words: our, we, us.  Maintain a straightfoward narrative: don't say: despite, however, in spite of, etc.  Don't use superlatives such as only, best, most, or entirely.",
        
        "Following your recent interview with a B2B tech CEO: {interview_transcript}, how would you neutrally describe the company's position in the market using simple words and including the customer problem the company solves?  Don't use buzzwords that are known for exageration, vagueness, being annoying or being overly-used . Speak as a neutral 3rd-party; don't use these words: our, we, us.  Maintain a straightfoward narrative: don't say: despite, however, in spite of, etc. Be brief.  Don't use superlatives such as only, best, most, or entirely.",
        
        "After reading an interview with a company CEO: {interview_transcript}, state the company's positioning. Be problem-solution oriented, clearly articulate a unique value proposition, use clear and non-promotional language, define or allude the target audience, make comparisons with competitors without naming any. Don't use buzzwords that are known for exageration, vagueness, being annoying or being overly-used. Speak as a neutral 3rd-party; don't use these words: our, we, us. Be straightfoward : don't say: despite, however, in spite of, etc. Max 5 sentences.  Don't use superlatives such as only, best, most, or entirely.",
        
        "Read this discovery interview with a company CEO: {interview_transcript}. Please state the company's positioning by being concise, problem-solution oriented, clearly articulating a unique value proposition, using clear and non-promotional language, defining or alluding to the target audience, making comparisons with competitors (without naming any). Don't use buzzwords that are known for exageration, vagueness, being annoying or being overly-used. Speak as a neutral 3rd-party analyst; don't use these words: our, we, us.  Don't meander: don't say: despite, however, in spite of, etc. Don't use superlatives such as only, best, most, or entirely."
    ]

    # Loop over the templates and generate responses
    responses = []
    for template in positioning_prompt_templates:
        # Format the template with your interview transcript
        formatted_prompt = template.format(interview_transcript=interview_transcript)
        
        # Create a system message to set the assistant's role
        system_message = SystemMessage(content="You are a Gartner analyst in the B2B tech space.")
        
        # Create a user message with the interview transcript
        user_message = HumanMessage(content=formatted_prompt)
        
        # Call the chat model with a list of messages
        response = chat_GPT40_09_functions([system_message, user_message])
        
        # Add the response to our list
        responses.append(response.content)
    
    best_positioning_response = best_positioning(responses, interview_transcript)
    best_positioning_index = int(best_positioning_response) - 1  # Assuming 1-based index in the response
    best_positioning_statement = responses[best_positioning_index]
    
    print("\n")  # This will print a line break.
    print(f"position statement options: {responses}")
    print("\n")  # This will print a line break.
    print(f"best option: {best_positioning_statement}")
    print("\n")  # This will print a line break.
    
    return best_positioning_statement



@app.route("/api/generatePositioning", methods=['POST'])
def generatePositioning():
    data = request.get_json()
    interview_id = data.get('interviewID')  # ensure the key name here matches the one sent from the client
    user_id = data.get('userID')
    print("interview_id:", interview_id)
    print("user_id:", user_id)
    
    if interview_id is not None:
        interview_id = str(interview_id)
        print("interview_id:", interview_id)
        interview_result = supabase.table('interviews').select('id, brand_name').eq('id', interview_id).execute()

        print(f"Full interview_result: {interview_result}")
        if interview_result['data']:
            interview = interview_result['data'][0]
        else:
            print('No data found for this interview_id')
            return jsonify({"status": "failure", "message": "No data found for this interview_id"})
        
    
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
    interview_transcript = f"For the brand '{interview['brand_name']}' discovery interv, these were the questions and answers:\n" + '\n'.join(paired_data) + ""

    # get positioning
    positioning_strategy = positioning_strategy_from_openai(interview_transcript)



    #data_to_insert = {
        #'interview_id':interview_id,
        #'positioning_statement': positioning_strategy_content,
        #'buyer_individual_profiles': buyer_individual_profiles,
        # ...similarly, insert other fields...
    #}
    #supabase.table('brand_strategies').insert(data_to_insert).execute()
    
    return jsonify({
        "positioning": positioning_strategy
    })
    
    
    
    
    
    
    
    
    
    
    
    
    def brand_strategy_from_openai(interview_transcript):

        positioning_prompt_templates = [
            "You are a Gartner analyst in the B2B tech space. Please review your interview with a company CEO: {interview_transcript}. Using clear, concise, and direct language, write down the company's positioning strategy. 3-5 short sentences. Don't use buzzwords that are exagerated, vague, annoying or overly used. Speak as a neutral 3rd-party; don't use these words: our, we, us.  Be straightfoward: don't say: despite, however, in spite of, etc.  Don't use superlatives such as only, best, most, or entirely.",
        
            "As a seasoned B2B tech analyst at Gartner, you've just finished your interview with a tech CEO. Here's what they shared: {interview_transcript}. In 3-5 sentences, articulate the company's position in the marketplace using simple, shortswords. Contextualize its positioning with how the market is changing.  Don't use buzzwords that are known for exageration, vagueness, being annoying or being overly-used. Speak as a neutral 3rd-party; don't use these words: our, we, us.  Maintain a straightfoward narrative: don't say: despite, however, in spite of, etc.  Don't use superlatives such as only, best, most, or entirely.",
        
            "Following your recent interview with a B2B tech CEO: {interview_transcript}, how would you neutrally describe the company's position in the market using simple words and including the customer problem the company solves?  Don't use buzzwords that are known for exageration, vagueness, being annoying or being overly-used . Speak as a neutral 3rd-party; don't use these words: our, we, us.  Maintain a straightfoward narrative: don't say: despite, however, in spite of, etc. Be brief.  Don't use superlatives such as only, best, most, or entirely.",
        
            "After reading an interview with a company CEO: {interview_transcript}, state the company's positioning. Be problem-solution oriented, clearly articulate a unique value proposition, use clear and non-promotional language, define or allude the target audience, make comparisons with competitors without naming any. Don't use buzzwords that are known for exageration, vagueness, being annoying or being overly-used. Speak as a neutral 3rd-party; don't use these words: our, we, us. Be straightfoward : don't say: despite, however, in spite of, etc. Max 5 sentences.  Don't use superlatives such as only, best, most, or entirely.",
        
            "Read this discovery interview with a company CEO: {interview_transcript}. Please state the company's positioning by being concise, problem-solution oriented, clearly articulating a unique value proposition, using clear and non-promotional language, defining or alluding to the target audience, making comparisons with competitors (without naming any). Don't use buzzwords that are known for exageration, vagueness, being annoying or being overly-used. Speak as a neutral 3rd-party analyst; don't use these words: our, we, us.  Don't meander: don't say: despite, however, in spite of, etc. Don't use superlatives such as only, best, most, or entirely."
        ]

        # Loop over the templates and generate responses
        responses = []
        for template in positioning_prompt_templates:
            # Format the template with your interview transcript
            formatted_prompt = template.format(interview_transcript=interview_transcript)
        
            # Create a system message to set the assistant's role
            system_message = SystemMessage(content="You are a Gartner analyst in the B2B tech space.")
        
            # Create a user message with the interview transcript
            user_message = HumanMessage(content=formatted_prompt)
        
            # Call the chat model with a list of messages
            response = chat_GPT40_09_functions([system_message, user_message])
        
            # Add the response to our list
            responses.append(response.content)
    
        best_positioning_response = best_positioning(responses, interview_transcript)
        best_positioning_index = int(best_positioning_response) - 1  # Assuming 1-based index in the response
        best_positioning_statement = responses[best_positioning_index]
    
        print("\n")  # This will print a line break.
        print(f"position statement options: {responses}")
        print("\n")  # This will print a line break.
        print(f"best option: {best_positioning_statement}")
        print("\n")  # This will print a line break.
    
        return best_positioning_statement
    
    
    
    
    
    
    @app.route("/api/generateBrandStrategy", methods=['POST'])
    def generateBrandStrategy():
        data = request.get_json()
        interview_id = data.get('interviewID')  # ensure the key name here matches the one sent from the client
        user_id = data.get('userID')
        print("interview_id:", interview_id)
        print("user_id:", user_id)
    
        if interview_id is not None:
            interview_id = str(interview_id)
            print("interview_id:", interview_id)
            interview_result = supabase.table('interviews').select('id, brand_name').eq('id', interview_id).execute()

            print(f"Full interview_result: {interview_result}")
            if interview_result['data']:
                interview = interview_result['data'][0]
            else:
                print('No data found for this interview_id')
                return jsonify({"status": "failure", "message": "No data found for this interview_id"})
        
    
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
        interview_transcript = f"For the brand '{interview['brand_name']}' discovery interv, these were the questions and answers:\n" + '\n'.join(paired_data) + ""

        # get positioning
        brand_strategy = brand_strategy_from_openai(interview_transcript)



        #data_to_insert = {
            #'interview_id':interview_id,
            #'positioning_statement': positioning_strategy_content,
            #'buyer_individual_profiles': buyer_individual_profiles,
            # ...similarly, insert other fields...
        #}
        #supabase.table('brand_strategies').insert(data_to_insert).execute()
    
        return jsonify({
            "brand strategy": brand_strategy
        })
    






#run app
# Run app in debug mode
app.run(host="localhost", port=8000, debug=True)
# Run app in production mode
#app.run(host="localhost", port=8000)