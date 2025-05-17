#!/usr/bin/env python
from random import randint

from pydantic import BaseModel

from crewai.flow import Flow, listen, start

from src.crewai.crews.preverify_agent.preverify_agent import PreverifyAgent

from dotenv import load_dotenv
import json
import os

load_dotenv()


class PreverifyState(BaseModel):
    lead_raw_data: str = ""
    criteria_field: str = ""
    lead_raw_data_result: str = ""
    preverify_lead_result: str = ""

class PreverifyFlow(Flow[PreverifyState]):

    @start()
    def read_lead_data(self):
        print("Reading lead data")
    
    @listen(read_lead_data)
    def process_lead_data(self):
        print("Processing lead data")
        result = (
            PreverifyAgent()
            .crew()
            .kickoff(inputs={"lead_raw_data": self.state.lead_raw_data, "criteria_field": self.state.criteria_field})
        )



def kickoff():
    preverify_flow = PreverifyFlow()
    preverify_flow.kickoff()


def plot():
    preverify_flow = PreverifyFlow()
    preverify_flow.plot()


def preverify_lead(lead_data, criteria_field=None):
    preverify_flow = PreverifyFlow()
    preverify_flow.state.lead_raw_data = lead_data
    
    if criteria_field:
        if isinstance(criteria_field, list):
            criteria_field = json.dumps(criteria_field)
        preverify_flow.state.criteria_field = criteria_field
        
    preverify_flow.kickoff()
    
    result_file_path = "result.txt"
    
    try:
        with open(result_file_path, "r") as f:
            result_content = f.read().strip()
            result_json = json.loads(result_content)
            return result_json
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error parsing result file: {str(e)}")
        return {
            "error": "Could not parse result as JSON",
            "raw_result": preverify_flow.state.preverify_lead_result
        }


if __name__ == "__main__":
    kickoff()
