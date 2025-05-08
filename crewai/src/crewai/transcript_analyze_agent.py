#!/usr/bin/env python
from random import randint

from pydantic import BaseModel

from crewai.flow import Flow, listen, start

from crews.transcript_analytics_crew.transcript_analytics_crew import TranscriptAnalyzeCrew

from dotenv import load_dotenv

load_dotenv()


class TranscriptState(BaseModel):
    customer_prompt: str = ""
    customer_prompt_result: str = ""
    transcript: str = ""

class TranscriptFlow(Flow[TranscriptState]):

    @start()
    def customer_prompt(self):
        print("Get customer prompt")
        self.state.customer_prompt = (
            "Company Location: The company must be based in Ho Chi Minh City. "
            "Staff Size: At least 10 employees. "
            "Budget: More than 10 million VND."
        )
        self.state.transcript = (
            "Bot: Hello! I'm calling from ABC Tax Services. We help businesses in Ho Chi Minh City with tax filing and financial cost optimization. "
            "May I ask where your company is currently located? "
            "Customer: We're in Ha Noi. "
            "Bot: Thank you! And how many employees does your company currently have? "
            "Customer: Around 10 people. "
            "Bot: Got it. What is your estimated budget for accounting or tax support services—monthly or annually? "
            "Customer: We're considering something between 15 to 20 million VND per year. "
            "Bot: That fits well with our service packages. Are you currently managing taxes in-house or working with an external provider? "
            "Customer: We've been doing it ourselves, but it's getting complicated so we're thinking about outsourcing. "
            "Bot: Understood. Thanks for sharing! Based on what you've told me, I'll send you a detailed quote by email shortly. "
        )


    
    @listen(customer_prompt)
    def prompt_analyze(self):
        print("Analyze Prompt")
        result = (
            TranscriptAnalyzeCrew()
            .crew()
            .kickoff(inputs={"customer_prompt": self.state.customer_prompt, "transcripts": self.state.transcript})
        )

        print("Customer prompt readed", result.raw)
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


if __name__ == "__main__":
    kickoff()
