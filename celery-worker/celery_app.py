from celery import Celery
from config import Config

app = Celery(
    "lead_verifier",
    broker=Config.RABBITMQ_URL,  # Use RabbitMQ as the broker
)

app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_routes={
        'tasks.aiCall': {'queue': 'aiCall.consumer'}, 
        'tasks.preVerify': {'queue': 'preVerify.consumer'},
        'tasks.sendWebhook': {'queue': 'sendWebhook.consumer'},
        'tasks.googleCalendar': {'queue': 'googleCalendar.consumer'}, 
    },
    broker_connection_timeout = 10,
    broker_heartbeat = 10  # Adjust heartbeat interval
)

def _import_tasks():
    import tasks.ai_call
    import tasks.pre_verify
    import tasks.send_webhook
    import tasks.google_calendar

_import_tasks()
