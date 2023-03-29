import os
from langchain.llms import OpenAI

# Set OpenAI API key
os.environ["OPENAI_API_KEY"] = "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"

#For this notebook, we will work with an OpenAI LLM wrapper, and pass it GPT4 as the model name.
llm = OpenAI(model_name="gpt-3.5-turbo",temperature=1)


#Let's try a more complex prompt. We'll use the prompt template from the previous notebook, and we'll use the `competitors` variable to pass in the competitor names.
from langchain.prompts import PromptTemplate
prompt = PromptTemplate(
    input_variables=["competitors"],
    template="Based on the information provided ({competitors}) and the surrounding context (B2B technology), please determine who these companies are and provide their websites and a high-level description of their offerings. Additionally please make the following boolean assessment: Differentiated or Not Differentiated.",
    )


# let's create a simple web server to test our agent
from flask import Flask, jsonify, Response, request
app = Flask(__name__)

@app.route('/competitor-analysis-html', methods=['GET'])
def get_agent_response():
    result = llm(prompt.format(competitors="Coastal Cloud and Acquis Consulting")) # the query is the prompt
    #return jsonify(result)
    html_result = result.replace('\n', '<br>')
    return Response(html_result, content_type='text/html; charset=utf-8')

if __name__ == '__main__':
    app.run(debug=True, port=5001)