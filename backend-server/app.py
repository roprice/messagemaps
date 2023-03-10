import requests # install requests because I want to make a GET request to the API
import os
import openai

#from flask import Flask

#app = Flask(__name__)
openai.api_key = "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"

gpt35turbo = openai.ChatCompletion.create(
  model="gpt-3.5-turbo-0301",
  messages=[{"role": "user", "content": "Think through this step-by-step and give me a passionate answer in the form of a bulleted list that reflect a logical progression in though. Can Whisper AI evaluate the emotional subtance of an audio file before it is transcribed?"}]
)

gptResponse = gpt35turbo["choices"][0]["message"]["content"]

print( gptResponse + "\n\n")



import paralleldots
paralleldots.set_api_key("fUE4KZzTXex4ASebbJKJd4NHbbNWs2gkvNUcXeEUOEc")

# for single sentence
text=gptResponse
lang_code="en"
response=paralleldots.sentiment(text,lang_code)
print(response)

# for multiple sentence as array
text=["Come on,lets play together","Team performed well overall.",gptResponse]
response=paralleldots.batch_sentiment(text)
print(response)