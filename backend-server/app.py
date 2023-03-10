import requests # install requests because I want to make a GET request to the API
import os
import openai

#from flask import Flask

#app = Flask(__name__)

openai.api_key = "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"

gpt35turbo = openai.ChatCompletion.create(
  model="gpt-3.5-turbo-0301",
  messages=[{"role": "user", "content": "Think through this step-by-step and give me an answer in the form of a bulleted list that reflect a logical progression in though. Can Whisper AI evaluate the emotional subtance of an audio file before it is transcribed?"}]
)

print(gpt35turbo["choices"][0]["message"]["content"] + "\n\n")


