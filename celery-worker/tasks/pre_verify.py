from celery_app import app

@app.task(name = "pre_verify")
def pre_verify(lead):    
    print(f"Calling {lead} ...")
    
    return {True}
    