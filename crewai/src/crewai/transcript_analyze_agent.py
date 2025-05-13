#!/usr/bin/env python
from random import randint

from pydantic import BaseModel

from crewai.flow import Flow, listen, start

from src.crewai.crews.transcript_analytics_crew.transcript_analytics_crew import TranscriptAnalyzeCrew

from dotenv import load_dotenv
import json
import os

load_dotenv()


class TranscriptState(BaseModel):
    customer_prompt: str = ""
    customer_prompt_result: str = ""
    transcript: str = ""

class TranscriptFlow(Flow[TranscriptState]):

    @start()
    def customer_prompt(self):
        print("Get customer prompt")
        print(f"Using customer prompt: {self.state.customer_prompt}")
        print(f"Using transcript: {self.state.transcript}")

    
    @listen(customer_prompt)
    def prompt_analyze(self):
        print("Analyze Prompt")
        result = (
            TranscriptAnalyzeCrew()
            .crew()
            .kickoff(inputs={"customer_prompt": self.state.customer_prompt, "transcripts": self.state.transcript})
        )

        print("Customer prompt analyzed", result.raw)
        self.state.customer_prompt_result = result.raw

    @listen(prompt_analyze)
    def evaluate_transcript(self):
        print("Evaluated transcript")
        with open("result.txt", "w") as f:
            f.write(self.state.customer_prompt_result)


def kickoff():
    analyze_flow = TranscriptFlow()
    analyze_flow.kickoff()


def plot():
    analyze_flow = TranscriptFlow()
    analyze_flow.plot()


def analyze_transcript(customer_prompt, transcript):

    analyze_flow = TranscriptFlow()
    analyze_flow.state.customer_prompt = customer_prompt
    analyze_flow.state.transcript = transcript
    analyze_flow.kickoff()
    
    result_file_path = "result.txt"
    
    try:
        with open(result_file_path, "r") as f:
            result_json = json.loads(f.read().strip())
            return result_json
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error parsing result file: {str(e)}")
        return {
            "error": "Could not parse result as JSON",
            "raw_result": analyze_flow.state.customer_prompt_result
        }


if __name__ == "__main__":
    kickoff()
