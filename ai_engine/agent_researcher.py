from langchain.tools import tool
from pydantic import BaseModel, Field
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import re

class ResearchInput(BaseModel):
    url: str = Field(description="The URL of the company website to research")

class ResearchOutput(BaseModel):
    summary: str = Field(description="Summary of the company")
    technologies: list[str] = Field(description="List of technologies detected (simulated)")
    key_personnel: list[str] = Field(description="Potential key contacts found")

def clean_text(text):
    return re.sub(r'\s+', ' ', text).strip()

def scrape_website(url: str):
    """
    Scrapes the landing page of the given URL.
    """
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            # Set a realistic user agent
            page.set_extra_http_headers({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"})
            
            page.goto(url, timeout=60000, wait_until="domcontentloaded")
            content = page.content()
            browser.close()
            
            soup = BeautifulSoup(content, 'html.parser')
            # Kill scripts and styles
            for script in soup(["script", "style", "nav", "footer"]):
                script.extract()
            
            text = soup.get_text()
            return clean_text(text)[:5000] # Return first 5000 chars to avoid token limits
            
    except Exception as e:
        return f"Error scraping {url}: {str(e)}"

@tool("research_company", args_schema=ResearchInput)
def research_company(url: str):
    """
    Performs a deep-dive research on a company website.
    """
    raw_text = scrape_website(url)
    
    # In a full Deep Tech implementation, this raw_text is fed to an LLM (e.g. GPT-4o) 
    # to extract the 'ResearchOutput' schema.
    # For this MVP Foundation step, we return the raw text.
    
    return {
        "source_url": url,
        "raw_content_preview": raw_text[:500],
        "full_content_length": len(raw_text)
    }

if __name__ == "__main__":
    # Test
    print(research_company.invoke({"url": "https://example.com"}))
