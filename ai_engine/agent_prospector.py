from duckduckgo_search import DDGS
from pydantic import BaseModel, Field

# Define the output structure
class Lead(BaseModel):
    company_name: str = Field(description="Name of the company found")
    website: str = Field(description="URL of the company website")
    context: str = Field(description="Brief description of why this company matches the ICP")




def search_leads(icp: str):
    """
    Executes a search for leads matching the ICP.
    Note: In a full implementation, this would use an LLM to parse search results.
    For this MVP step, we will perform a direct search and simulate the LLM parsing 
    or use a local LLM if available. 
    
    Since we are in the 'Foundation' phase and might not have a running LLM connected yet,
    this function currently returns raw search results which an LLM *should* process.
    """
    # query = f"companies that are {icp}" 
    # Use a more direct query to find homepages
    # Direct usage of DDGS
    raw_results = []
    
    queries = [f"{icp} official website", icp] # Try specific then general
    
    with DDGS() as ddgs:
        for q in queries:
            print(f"DEBUG: Searching DDGS for: {q}")
            raw_results = list(ddgs.text(q, max_results=20))
            if raw_results:
                break # Stop if we found something
        
    # Heuristic Filtering: Remove known aggregators and non-company sites
    blacklist = ["wikipedia.org", "linkedin.com/lists", "clutch.co", "yelp.com", "top10", "best of", "google.com", "support.google.com", "play.google.com"]
    
    filtered_results = []
    seen_domains = set()
    
    print(f"DEBUG: Found {len(raw_results)} raw results. Filtering...")
    
    for r in raw_results:
        href = r.get('href', '').lower()
        title = r.get('title', '').lower()
        
        print(f"DEBUG: Limit Check: {href}")
        
        # Skip if in blacklist
        if any(b in href for b in blacklist):
            print(f"DEBUG: Blacklisted: {href}")
            continue
            
        # Deduplicate domains
        domain = href.split('/')[2] if '//' in href else href
        if domain in seen_domains:
            continue
        seen_domains.add(domain)
        
        filtered_results.append(r)
        
        if len(filtered_results) >= 5:
            break
            
    print(f"DEBUG: Returning {len(filtered_results)} filtered leads.")
    return {"raw_results": filtered_results}

if __name__ == "__main__":
    # Test
    print(search_leads("Series B Fintech startups in London"))
