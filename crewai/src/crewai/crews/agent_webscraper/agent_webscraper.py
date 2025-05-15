from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import FileWriterTool
from crawl4ai import AsyncWebCrawler
import json
import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor

file_writer_tool = FileWriterTool(
    filename="scraping_result.txt",
    directory="agent_webscraper",
)

@CrewBase
class WebScraperCrew:
    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def web_scraper_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["web_scraper_agent"],
            tools=[file_writer_tool],
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
        self.crawler = AsyncWebCrawler()
        self.scraper_crew = WebScraperCrew()
        self.executor = ThreadPoolExecutor(max_workers=5)

    async def _scrape_url(self, url: str):
        """Internal method to scrape URL using AsyncWebCrawler"""
        result = await self.crawler.arun(url)
        # Convert CrawlResultContainer to dictionary
        return {
            "title": result.title if hasattr(result, 'title') else "",
            "text": result.text if hasattr(result, 'text') else "",
            "html": result.html if hasattr(result, 'html') else "",
            "links": list(result.links) if hasattr(result, 'links') else [],
            "meta": {
                "description": result.meta.get("description", "") if hasattr(result, 'meta') else "",
                "keywords": result.meta.get("keywords", "") if hasattr(result, 'meta') else ""
            }
        }

    def _run_async_scrape(self, url: str):
        """Run async scraping in a new event loop"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(self._scrape_url(url))
        finally:
            loop.close()

    def scrape_and_analyze(self, url: str, prompt_criteria: str):
        """Synchronous method to handle scraping and analysis"""
        try:
            # Run scraping in a separate thread with its own event loop
            scraped_content = self.executor.submit(self._run_async_scrape, url).result()

            # Convert scraped content to string for the crew
            content_summary = f"""
                            Website: {url}
                            Title: {scraped_content['title']}
                            Description: {scraped_content['meta']['description']}
                            Keywords: {scraped_content['meta']['keywords']}

                            Content:
                            {scraped_content['text']}
             """.strip()

            # Execute crew tasks
            result = self.scraper_crew.crew().kickoff(
                inputs={
                    "url": url,
                    "scraped_content": content_summary,
                    "prompt_criteria": prompt_criteria
                }
            )

            # Parse and return results
            try:
                with open("scraping_result.txt", "r") as f:
                    result_json = json.loads(f.read().strip())
                    return result_json
            except (FileNotFoundError, json.JSONDecodeError) as e:
                return {
                    "error": "Failed to parse results",
                    "message": str(e)
                }

        except Exception as e:
            return {
                "error": "Failed to scrape and analyze",
                "message": str(e)
            }
