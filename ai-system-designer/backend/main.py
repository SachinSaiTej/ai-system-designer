from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os
import uuid
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="AI System Designer", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data file paths
DESIGNS_FILE = "data/designs.json"
PROMPTS_FILE = "data/prompts.json"

# Initialize OpenAI client
client = OpenAI()
client.api_key = os.getenv("OPENAI_API_KEY")

# Pydantic models
class DesignRequest(BaseModel):
    requirements: str
    assumptions: Dict[str, Any]
    constraints: List[str]

class UpdateDesignRequest(BaseModel):
    design_id: str
    user_edits: str

class Design(BaseModel):
    id: str
    version: int
    timestamp: str
    requirements: str
    assumptions: Dict[str, Any]
    constraints: List[str]
    design: Dict[str, Any]
    parent_id: Optional[str] = None

# Utility functions
def load_json_file(filepath: str) -> Dict[str, Any]:
    """Load JSON file, create empty dict if file doesn't exist"""
    if not os.path.exists(filepath):
        return {}
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return {}

def save_json_file(filepath: str, data: Dict[str, Any]) -> None:
    """Save data to JSON file"""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

def load_prompts() -> Dict[str, str]:
    """Load prompt templates"""
    return load_json_file(PROMPTS_FILE)

def load_designs() -> Dict[str, Design]:
    """Load all designs"""
    designs_data = load_json_file(DESIGNS_FILE)
    return {k: Design(**v) for k, v in designs_data.items()}

def save_design(design: Design) -> None:
    """Save a single design"""
    designs = load_json_file(DESIGNS_FILE)
    designs[design.id] = design.dict()
    save_json_file(DESIGNS_FILE, designs)

async def call_openai_api(prompt: str, user_input: str) -> Dict[str, Any]:
    """Call OpenAI API with prompt and user input"""
    try:
        # Combine system prompt with user input to maintain existing functionality
        system_instruction = "You are an expert system architect. Always respond with valid JSON that matches the requested schema exactly."
        full_prompt = f"{system_instruction}\n\n{prompt}\n\nUser Input:\n{user_input}\n\nPlease provide a structured JSON response following the schema described in the prompt."
        
        response = client.responses.create(
            model="gpt-5",
            input=full_prompt,
            # Maintain existing functionality parameters
            # response_format="json_object",
            # max_completion_tokens=2000
        )
        
        # Parse the JSON response
        print("Response from AI", response.output_text)
        design_json = json.loads(response.output_text)
        return design_json
        
    except json.JSONDecodeError as e:
        print(f"Invalid JSON response from AI: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Invalid JSON response from AI: {str(e)}")
    except Exception as e:
        print(f"Error calling OpenAI API: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

# API Endpoints
@app.get("/")
async def root():
    return {"message": "AI System Designer API"}

@app.post("/generate_design")
async def generate_design(request: DesignRequest):
    """Generate a new system design based on requirements"""
    try:
        # Validate OpenAI API key
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(status_code=500, detail="OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.")
        
        # Validate requirements
        if not request.requirements.strip():
            raise HTTPException(status_code=400, detail="Requirements cannot be empty.")
        
        # Load prompts
        prompts = load_prompts()
        hld_prompt = prompts.get("hld", "Generate a high-level system design.")
        
        # Prepare user input
        user_input = f"""
        Requirements: {request.requirements}
        Assumptions: {json.dumps(request.assumptions, indent=2)}
        Constraints: {', '.join(request.constraints)}
        """
        
        # Call OpenAI API
        design_result = await call_openai_api(hld_prompt, user_input)
        
        # Create design object
        design = Design(
            id=str(uuid.uuid4()),
            version=1,
            timestamp=datetime.now().isoformat(),
            requirements=request.requirements,
            assumptions=request.assumptions,
            constraints=request.constraints,
            design=design_result
        )
        
        # Save design
        save_design(design)
        
        return design.dict()
        
    except HTTPException as he:
        print(f"Error generating design: {str(he)}")
        raise
    except Exception as e:
        print(f"Error generating design: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating design: {str(e)}")

@app.get("/list_designs")
async def list_designs():
    """Get all saved designs"""
    try:
        designs = load_designs()
        # Sort by timestamp (most recent first)
        sorted_designs = sorted(
            designs.values(),
            key=lambda x: x.timestamp,
            reverse=True
        )
        return [design.dict() for design in sorted_designs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading designs: {str(e)}")

@app.post("/update_design")
async def update_design(request: UpdateDesignRequest):
    """Update an existing design based on user edits"""
    try:
        # Validate OpenAI API key
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(status_code=500, detail="OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.")
        
        # Validate user edits
        if not request.user_edits.strip():
            raise HTTPException(status_code=400, detail="User edits cannot be empty.")
        
        # Load existing designs
        designs = load_designs()
        
        if request.design_id not in designs:
            raise HTTPException(status_code=404, detail="Design not found")
        
        original_design = designs[request.design_id]
        
        # Load prompts
        prompts = load_prompts()
        reconcile_prompt = prompts.get("reconcile", "Reconcile design changes.")
        
        # Prepare reconciliation input
        reconcile_input = f"""
        Original Design: {json.dumps(original_design.design, indent=2)}
        User Edits: {request.user_edits}
        """
        
        # Call OpenAI API for reconciliation
        updated_design_result = await call_openai_api(reconcile_prompt, reconcile_input)
        
        # Extract updated_design from the response if it follows the reconcile schema
        if isinstance(updated_design_result, dict) and "updated_design" in updated_design_result:
            final_design = updated_design_result["updated_design"]
        else:
            final_design = updated_design_result
        
        # Create new version
        new_design = Design(
            id=str(uuid.uuid4()),
            version=original_design.version + 1,
            timestamp=datetime.now().isoformat(),
            requirements=original_design.requirements,
            assumptions=original_design.assumptions,
            constraints=original_design.constraints,
            design=final_design,
            parent_id=request.design_id
        )
        
        # Save new version
        save_design(new_design)
        
        return new_design.dict()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating design: {str(e)}")

@app.get("/design/{design_id}")
async def get_design(design_id: str):
    """Get a specific design by ID"""
    try:
        designs = load_designs()
        if design_id not in designs:
            raise HTTPException(status_code=404, detail="Design not found")
        return designs[design_id].dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading design: {str(e)}")  
    
def test():
    from openai import OpenAI
    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")

    response = client.responses.create(
        model="gpt-5",
        input="Write a one-sentence bedtime story about a unicorn."
    )

    print(response.output_text)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    # test()