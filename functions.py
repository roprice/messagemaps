

import langchain
import openai
import json

# Environment Variables
import os
from dotenv import load_dotenv

load_dotenv()

# Set OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')
if openai.api_key is None:
    raise ValueError("OPENAI_API_KEY environment variable not set")


function_descriptions = [
    {
        "name": "cityname_weather",
        "description": "",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city, eg  Austin",
                },
                "unit": {
                    "type": "string",
                    "description": "The temperature unit to use. Infer from location.",
                    "enum": ["celsius", "fahrenheit"]
                },
            },
            "required": ["location"],
        },
    }
]
        
user_query = "Hey what's the weather like in the big easy tonight?"

get_function_json_from_human_query = openai.ChatCompletion.create(
    model="gpt-4-0613",
    # This is the chat message from the user
    messages=[{"role": "user", "content": user_query}],
    functions=function_descriptions,
    function_call="auto",
)

openai_weather_json = get_function_json_from_human_query["choices"][0]["message"]

# Extract the arguments from the function call
user_location = json.loads(openai_weather_json['function_call']['arguments']).get("location")
user_unit = json.loads(openai_weather_json['function_call']['arguments']).get("unit")



def get_weather_api(location, unit):
    
    """Get the current weather in a given location"""
    
    json_weather_info = {
        "location": location,
        "temperature": "72",
        "unit": unit,
        "forecast": ["sunny", "windy"],
    }
    return json.dumps(json_weather_info)

# Call the dummy function with the arguments extracted from the AI's response
get_weather_with_openai_json = get_weather_api(
    location=user_location,
    unit=user_unit,
)


second_response = openai.ChatCompletion.create(
    model="gpt-4-0613",
    messages=[
        {"role": "system", "content": "You are a close friend that adapts to the user's tone and style."},
        {"role": "user", "content": user_query},
        openai_weather_json,
        {
            "role": "function",
            "name": "get_current_weather",
            "content": get_weather_with_openai_json,
        },
    ],
)


print("\n")  # This will print a line break.
print("--- human query - what the person says in natural language----")  # This will print a horizontal rule.

print(user_query)


print("\n")  # This will print a line break.
print("---raw json from openai as the result of human query----")  # This will print a horizontal rule.

print(openai_weather_json)

print("\n")  # This will print a line break.
print("--- Key variables parsed from openai ----")  # This will print a horizontal rule.

print(f"Location: {user_location}, Unit: {user_unit}")

print("\n")  # This will print a line break.
print("--- Use OpenAI function json to get weather from weather API ----")  # This will print a horizontal rule.

print(get_weather_with_openai_json)

print("\n")  # This will print a line break.
print("---Use OpenAI to put that back into human language----")  # This will print a horizontal rule.

print (second_response['choices'][0]['message']['content'])

print("\n")  # This will print a line break.
print("\n")  # This will print a line break.