
import openai

# Set the OpenAI API key using the openai.api_key variable
openai.api_key = api_key = "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"

gpt35turbo = openai.ChatCompletion.create(
  model="gpt-3.5-turbo-0301",
  messages=[{"role": "user", "content": "what is a brand message map? can you think about this step by step and write me a high-level breakdown in the style of hemingway and following the recommendations of strunk and white?"}]
)

gptResponse = gpt35turbo["choices"][0]["message"]["content"]

print( gptResponse + "\n\n")

