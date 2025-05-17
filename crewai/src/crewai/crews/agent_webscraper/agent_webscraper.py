from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import FileWriterTool
import json
from crewai_tools import ScrapeWebsiteTool

file_writer_tool = FileWriterTool(
    filename="scraping_result.txt",
    directory="agent_webscraper",
)



@CrewBase
class WebScraperCrew:

    scrape_website_tool = ScrapeWebsiteTool(
        max_depth=2,
        max_pages=10,
        max_concurrent_requests=5,
        max_retries=3,
        timeout=10,
    )

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def web_scraper_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["web_scraper_agent"],
            tools=[self.scrape_website_tool],
        )

    @agent
    def criteria_analyzer_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["criteria_analyzer_agent"],
            tools=[file_writer_tool],
        )

    @task
    def scrape_website(self) -> Task:
        return Task(
            config=self.tasks_config["scrape_website"],
        )

    @task
    def analyze_content(self) -> Task:
        return Task(
            config=self.tasks_config["analyze_content"],
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )

class WebScraper:
    def __init__(self):
        self.scraper_crew = WebScraperCrew()

    def scrape_and_analyze(self, url: str, prompt_criteria: str):
        try:
            result = self.scraper_crew.crew().kickoff(
                inputs={
                    "website_url": url,
                    "prompt_criteria": prompt_criteria
                }
            )

            try:
                    result_json = json.loads(result)
                    return result_json
            except (json.JSONDecodeError) as e:
                return {
                    "error": "Failed to parse results",
                    "message": str(e)
                }

        except Exception as e:
            return {
                "error": "Failed to scrape and analyze",
                "message": str(e)
            }
