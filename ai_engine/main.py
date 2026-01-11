from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from graph import app as agent_app
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Lead Gen AI Engine")

class ProspectRequest(BaseModel):
    icp: str

@app.get("/")
def health_check():
    return {"status": "AI Engine Operational", "mode": "Deep Tech"}

@app.post("/prospect")
def prospect(request: ProspectRequest):
    try:
        # Run the LangGraph workflow
        result = agent_app.invoke({"icp": request.icp, "leads": [], "reports": [], "errors": []})
        return {
            "status": "success", 
            "data": {
                "leads": result.get("leads"),
                "reports": result.get("reports"),
                "errors": result.get("errors")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
