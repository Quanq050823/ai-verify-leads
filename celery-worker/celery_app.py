from celery import Celery

app = Celery(
    "lead_verifier",
    broker="amqps://nwamfqru:gJGB3604woWxdfuNxp5wk9XZ84g_OkOh@chameleon.lmq.cloudamqp.com/nwamfqru",
    backend="rpc://",  # Optional: use Redis or db if needed
)

app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_routes={
        'tasks.ai_call': {'queue': 'aiCall.consumer'},
        'tasks.pre_verify': {'queue': 'preVerify.consumer'},
        'tasks.send_webhook': {'queue': 'sendWebhook.consumer'},
    }
)

def _import_tasks():
    import tasks.ai_call
    import tasks.pre_verify
    import tasks.send_webhook

_import_tasks()
