from celery import Task

from utils.dbUtils import *
import traceback

class BaseTaskHandler(Task):
    
    def on_success(self, retval, task_id, args, kwargs):
        print(f"Custom success handling for {self.name}")
        # Update fields here too
        super().on_success(retval, task_id, args, kwargs)

    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        # Log the error or perform any other failure handling logic
        print(f"Task {self.name} failed: {exc}")
        # print(f"Task ID: {task_id}")
        # print(f"Arguments: {args}")
        # print(f"Keyword Arguments: {kwargs}")
        tb_string = ''.join(traceback.format_exception(
            type(exc), 
            exc, 
            exc.__traceback__
        ))

        print("")
        
        data = kwargs["message"]
        update_field = {
            "status": 0,
            "error": {
                "status": True,
                "message": (f"Task {self.name} failed: {exc}"),
                "taskId": task_id,
                "stackTrace": tb_string[:5000]
            },
        }
        
        update_lead(data["leadId"], update_field)