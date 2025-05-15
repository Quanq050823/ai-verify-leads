from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import FileWriterTool



file_writer_tool_lead_raw_data = FileWriterTool(
    filename="lead_raw_data_result.txt",
    directory="preverify_agent",
)

file_writer_tool_preverify_lead = FileWriterTool(
    filename="preverify_lead_result.txt",
    directory="preverify_agent",
)
# If you want to run a snippet of code before or after the crew starts,
# you can use the @before_kickoff and @after_kickoff decorators
# https://docs.crewai.com/concepts/crews#example-crew-class-with-decorators


@CrewBase
class PreverifyAgent:

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def read_lead_data_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["read_lead_data_agent"],  # type: ignore[index]
            tools=[file_writer_tool_lead_raw_data],
        )
    
    @agent
    def preverify_lead_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["preverify_lead_agent"],  # type: ignore[index]
            tools=[file_writer_tool_preverify_lead],
        )

    @task
    def read_lead(self) -> Task:
        return Task(
            config=self.tasks_config["read_lead"],  # type: ignore[index]
        )

    @task
    def preverify_lead(self) -> Task:
        return Task(
            config=self.tasks_config["preverify_lead"],  # type: ignore[index]
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,  # Automatically created by the @agent decorator
            tasks=self.tasks,  # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
        )


