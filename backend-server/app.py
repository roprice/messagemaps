import requests # install requests because I want to make a GET request to the API
import os
import openai

#from flask import Flask

#app = Flask(__name__)

# Open the text file containing the API key and read its contents
with open('../ai_models/openai/key.txt', 'r') as f:
    openai_api_key = f.read().strip()

# Set the OpenAI API key using the openai.api_key variable
openai.api_key = openai_api_key

gpt35turbo = openai.ChatCompletion.create(
  model="gpt-3.5-turbo-0301",
  messages=[{"role": "user", "content": "what is the inner life of a labrador like?"}]
)

gptResponse = gpt35turbo["choices"][0]["message"]["content"]

print( gptResponse + "\n\n")



with open('../ai_models/komprehend/key.txt', 'r') as f:
    komprehend_api_key = f.read().strip()

import paralleldots
paralleldots.set_api_key(komprehend_api_key)

# for single sentence
text=gptResponse
lang_code="en"
komprehend_response=paralleldots.sentiment(text,lang_code)
print(komprehend_response)