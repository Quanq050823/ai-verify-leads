from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import FileWriterTool



file_writer_tool_prompt_analyzer = FileWriterTool(
    filename="customer_prompt_result.txt",
    directory="transcript_analytics_crew",
)

file_writer_tool_transcript_analyzer = FileWriterTool(
    filename="transcript_result.txt",
    directory="transcript_analytics_crew",
)
# If you want to run a snippet of code before or after the crew starts,
# you can use the @before_kickoff and @after_kickoff decorators
# https://docs.crewai.com/concepts/crews#example-crew-class-with-decorators


@CrewBase
class TranscriptAnalyzeCrew:

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def prompt_analyzer_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["prompt_analyzer_agent"],  # type: ignore[index]
            tools=[file_writer_tool_prompt_analyzer],
        )
    
    @agent
    def transcript_analyzer_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["transcript_analyzer_agent"],  # type: ignore[index]
            tools=[file_writer_tool_transcript_analyzer],
        )

    @task
    def analyze_prompt(self) -> Task:
        return Task(
            config=self.tasks_config["analyze_prompt"],  # type: ignore[index]
        )

    @task
    def evaluate_transcript(self) -> Task:
        return Task(
            config=self.tasks_config["evaluate_transcript"],  # type: ignore[index]
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,  # Automatically created by the @agent decorator
            tasks=self.tasks,  # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
        )


