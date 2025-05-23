from celery_app import app
import requests
import json
import os
from urllib.parse import urljoin
import logging

import datetime
from utils.dbUtils import *
from tasks.base_tasks_handler import BaseTaskHandler

@app.task(name = "tasks.sendWebhook", base= BaseTaskHandler, bind=True, max_retries=3)
def send_webhook(self, message):    
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    logger.info(f"CallReceived message {message} ...")

    lead = get_lead(message)
    settings = get_node_settings(message)
    
    # Get webhook URL from environment variable or use default
    webhook_url = settings.get("webhookUrl", None)

    try:
        # Prepare the payload
        payload = {
            'lead_data': lead.get("leadData"),
            'timestamp': datetime.datetime.now().isoformat()
        }
        
        # Send the POST request to the webhook
        response = requests.post(
            webhook_url,
            data=json.dumps(payload),
            headers={'Content-Type': 'application/json'}
        )
        
        # Check if the request was successful
        response.raise_for_status()
        logger.info(f"Successfully sent webhook to {webhook_url}, status code: {response.status_code}")
        
        return {'status': response.status_code, 'data': response.text}
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send webhook: {str(e)}")
        if self.request.retries < self.max_retries:
            countdown = 5  # Retry after 5 seconds
            raise self.retry(exc=e, countdown=countdown)
        raise
    
    