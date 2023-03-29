

import os

import langchain
from langchain import OpenAI, ConversationChain
from langchain.llms import OpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.agents import load_tools
from langchain.agents import initialize_agent


# Set OpenAI API key
os.environ["OPENAI_API_KEY"] = "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"
os.environ["SERPAPI_API_KEY"] = "439c3bed1e05e42b21864eb81bb679f20245d8bd3e2845c65c8e73eb748b7370"


# First, let's load the language model we're going to use to control the agent.
llm = OpenAI(model_name="gpt-3.5-turbo",temperature=1)


# Create prompt template
prompt = PromptTemplate(
   input_variables=["competitors"],
   template="Based on the information provided ({competitors}) and the surrounding context (B2B technology), please determine who these companies are and provide their websites and a high-level description of their offerings. Additionally please make the following boolean assessment: Differentiated or Not Differentiated.",
)


#competitor name entered by user
#chain = LLMChain(llm=llm, prompt=prompt)
#chain.run("Coastal Cloud")



# Next, let's load some tools to use. Note that the `llm-math` tool uses an LLM, so we need to pass that in.
tools = load_tools(["serpapi", "llm-math"], llm=llm)


# Finally, let's initialize an agent with the tools, the language model, and the type of agent we want to use.
agent = initialize_agent(tools, llm, agent="zero-shot-react-description", verbose=True)

userSubmission = "Coastal Cloud and Acquis Consulting"

# Now let's test it out!
agent.run(prompt.format(competitors=userSubmission))



# let's create a simple web server to test our agent

from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/competitor-analysis-json', methods=['GET'])
def get_agent_response():
    query = prompt.format(competitors=userSubmission)
    result = agent.run(query)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)