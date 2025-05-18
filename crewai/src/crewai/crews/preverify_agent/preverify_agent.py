from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import FileWriterTool


file_writer_tool_preverify_lead = FileWriterTool(
    filename="result.txt",
    directory="preverify_agent",
)



@CrewBase
class PreverifyAgent:

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"
    @agent
    def preverify_lead_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["preverify_lead_agent"],  # type: ignore[index]
            tools=[file_writer_tool_preverify_lead],
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


