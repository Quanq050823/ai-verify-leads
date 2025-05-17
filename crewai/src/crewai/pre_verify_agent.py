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
    lead_raw_data: str = ("{ \"leadData\": { \"company_name\": \"NextGen Ventures\", \"custom_fields\": { \"annual_revenue\": \"$5M\", \"company_size\": \"50-100\", \"industry\": \"Finance\" }, \"email\": \"emma.wilson@nextgen.com\", \"full_name\": \"Emma Wilson\", \"job_title\": \"CTT Head of Strategy\", \"phone\": \"+1-202-555-0143\" } }")
    criteria_field: str = " [ { \"field\": \"email\", \"type\": \"string\", \"operator\": \"is_valid_email\", \"must_met\": true, \"value\": \"\" }, { \"field\": \"job_title\", \"type\": \"string\", \"operator\": \"starts_with\", \"must_met\": true, \"value\": \"CTT\" } ] "
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

        print("Lead data processed", result.raw)
        
        # Read the result from file
        lead_raw_data_path = "preverify_agent/lead_raw_data_result.txt"
        try:
            with open(lead_raw_data_path, "r") as f:
                self.state.lead_raw_data_result = f.read()
        except FileNotFoundError:
            print(f"Warning: Could not find {lead_raw_data_path}")
            self.state.lead_raw_data_result = result.raw

    @listen(process_lead_data)
    def preverify_lead(self):
        print("Preverifying lead")
        # The preverify result should already be written to file by the PreverifyAgent crew
        preverify_lead_path = "preverify_agent/preverify_lead_result.txt"
        try:
            with open(preverify_lead_path, "r") as f:
                self.state.preverify_lead_result = f.read()
                with open("result.txt", "w") as result_file:
                    result_file.write(self.state.preverify_lead_result)
        except FileNotFoundError:
            print(f"Warning: Could not find {preverify_lead_path}")
            with open("result.txt", "w") as f:
                f.write(self.state.lead_raw_data_result)


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
