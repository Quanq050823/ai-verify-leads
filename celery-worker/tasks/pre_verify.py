from celery_app import app
from db import get_mongo_client
from utils.dbUtils import *
import requests
import json
from concurrent.futures import ThreadPoolExecutor

from config import Config
from tasks.base_tasks_handler import BaseTaskHandler


def make_post_request(url, json_data):
    """Make a POST request and return the response data"""
    print(f"Making POST request to {url}.")
    response = requests.post(
        url=url,
        json=json_data,
        headers={'Content-Type': 'application/json'}
    )
    response.raise_for_status()  # Raise an error for bad responses
    return response.json()


def check_url(url):
    headers = {
        "Authorization": f"Bearer {Config.OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": Config.OPENAI_MODEL,
        "messages": [
            {
                "role": "system",
                "content": """
                            You are a content safety analysis assistant. 
                            You will verify the validity of URLs and determine 
                            if they contain any sensitive content. Return the content 
                            in JSON with the format:
                            {
                                "isValid": true/false, 
                                "reason": "tell the specific reason in less than 10 words"
                            }
                        """
            },
            {
                "role": "user",
                "content": f"Check the following URL: {url}. Tell me if it is valid and if it contains any sensitive content."
            }
        ]
    }

    print("Sending request to OpenAI API for URL check.")
    response = requests.post(
        "https://api.openai.com/v1/chat/completions", headers=headers, json=data)

    if response.status_code == 200:
        return json.loads(response.json()["choices"][0]["message"]["content"])
    else:
        return f"Error: {response.status_code} - {response.text}"


@app.task(name="tasks.preVerify", base=BaseTaskHandler, bind=True, max_retries=3)
def pre_verify(self, message):
    try:
        print(f"Received message: {message}")

        settings = get_node_settings(message)
        lead = get_lead(message)

        criteria = settings.get("criteria")
        if not criteria:
            print("No criteria found in settings.")
            raise ValueError("No criteria found in settings.")

        verifyFieldBody = {
            "leadData": json.dumps(lead['leadData']),
            "criteriaField": json.dumps(criteria),
        }

        scrapeBody = {
            "url": lead['leadData']['custom_fields']['website_link'],
            "promptCriteria": settings['webScrapingPrompt'],
        }

        fieldResponse, scrapeResponse = {}, {}
        # Using ThreadPoolExecutor to run requests concurrently
        with ThreadPoolExecutor() as executor:
            # Submit both API requests
            if lead['leadData']['custom_fields']['website_link']:
                check = check_url(lead['leadData']['custom_fields']['website_link'])
                print("Check URL API:", check)
                if check["isValid"] == False:
                    return {'status': False, "reason": check["reason"]}
                scrape = executor.submit(
                    make_post_request, "http://127.0.0.1:5000/scrape", scrapeBody)
                scrapeResponse = scrape.result()

            fieldVerify = executor.submit(
                make_post_request, "http://127.0.0.1:5000/preverify", verifyFieldBody)
            fieldResponse = fieldVerify.result()

            print("Field verify API:", fieldResponse)
            print("Response from web scraping API:", scrapeResponse)

        return fieldResponse['pass'] and scrapeResponse['pass']
    except Exception as e:
        print("Error calling external API:", str(e))
        if self.request.retries < self.max_retries:
            countdown = 5  # Retry after 5 seconds
            raise self.retry(exc=e, countdown=countdown)
        raise
