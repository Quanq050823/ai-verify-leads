from celery_app import app

@app.task(name = "send_webhook")
def send_webhook(lead):    
    print(f"Calling {lead} ...")
    
    return {True}
    