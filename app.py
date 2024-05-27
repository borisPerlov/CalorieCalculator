from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
import requests
from io import BytesIO
import openai
from langsmith.wrappers import wrap_openai
from langsmith import traceable
from langsmith.prompts import PromptTemplate

from dotenv import load_dotenv
load_dotenv()


client = wrap_openai(openai.Client())


# @traceable # Auto-trace this function
# def pipeline(user_input: str):
#     result = client.chat.completions.create(
#         messages=[{"role": "user", "content": user_input}],
#         model="gpt-3.5-turbo"
#     )
#     return result.choices[0].message.content

# pipeline("Hello, world!")

app = Flask(__name__)

# # Set up LangChain OpenAI integration

# langchain_openai = OpenAI()

# Define the LangChain prompt template for processing the image
calorie_prompt = PromptTemplate(
    input_variables=["image_description"],
    template="You are a calorie estimation expert. Based on the following description of an image, provide an estimate of the calories: {image_description}",
)

# Function to handle image processing and calorie calculation
def process_image(image_url):
    # Download the image
    response = requests.get(image_url)
    image_data = BytesIO(response.content)

    # Process image using LangChain's OpenAI Vision (assuming it handles vision)
    # You will need a prompt that helps LangChain understand the content of the image
    vision_prompt = PromptTemplate(
        input_variables=["image_data"],
        template="Analyze the following image and describe the food items in it: {image_data}",
    )
    vision_chain = SimpleChain.from_prompts([vision_prompt])
    image_description = vision_chain(image_data.getvalue())

    # Use LangChain to process the image description and calculate calories
    calorie_chain = SimpleChain.from_prompts([calorie_prompt])
    calorie_estimate = calorie_chain(image_description)

    return calorie_estimate

# Route to handle incoming WhatsApp messages
@app.route('/whatsapp', methods=['POST'])
def whatsapp_webhook():
    msg = request.form.get('Body')
    media_url = request.form.get('MediaUrl0')

    if media_url:
        calories = process_image(media_url)
        response_message = f"The estimated calories for the item are: {calories}."
    else:
        response_message = "Please send an image to get the calorie count."

    resp = MessagingResponse()
    resp.message(response_message)
    return str(resp)

if __name__ == '__main__':
    app.run(debug=True)