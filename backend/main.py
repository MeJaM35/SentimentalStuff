import os
import json
import typing_extensions as typing
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv

from auth import (
    Base, engine, fastapi_users, auth_backend, 
    current_active_user, User, UserRead, UserCreate
)

# Load environment variables from the root folder
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
load_dotenv(env_path)

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite DB on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="Sentiment Analyzer API", lifespan=lifespan)

# Add CORS Middleware to allow Next.js frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For POC only. In prod, use ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Auth Routes (/auth/jwt/login, /auth/register)
app.include_router(
    fastapi_users.get_auth_router(auth_backend), 
    prefix="/auth/jwt", 
    tags=["auth"]
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

class SentenceAnalysis(typing.TypedDict):
    sentence: str
    sentiment: str

class KPIs(typing.TypedDict):
    Agent_Empathy_Score: int
    Customer_Frustration_Index: int
    Resolution_Likelihood: int

class AnalysisResult(typing.TypedDict):
    thought_process: str
    overall_sentiment: str
    summary: str
    emotions: list[str]
    sentence_analysis: list[SentenceAnalysis]
    kpis: KPIs

@app.post("/analyze")
async def analyze_transcript(
    file: UploadFile = File(...),
    user: User = Depends(current_active_user)
):
    """
    Protected endpoint implementing an Agentic architecture for transcript analysis.
    Uses strict schema guardrails and Chain-of-Thought reasoning.
    """
    if not file.filename.endswith(".txt"):
        raise HTTPException(status_code=400, detail="Only .txt files are allowed")
    
    content = await file.read()
    text = content.decode("utf-8")
    
    # Improved Agentic Prompt with Guardrails
    system_prompt = """You are an elite Customer Experience (CX) AI Agent. 
Your objective is to deeply analyze support transcripts and extract actionable intelligence.

**Agent Directives:**
1. **Chain of Thought**: You must first use the 'thought_process' field to internally reason about the customer's journey, the root cause of their issue, and the agent's de-escalation tactics.
2. **KPI Derivation**: Base your KPI scores strictly on your thought process. 
   - Agent_Empathy_Score (1-10): Did they validate feelings or sound robotic?
   - Customer_Frustration_Index (1-10): Peak frustration level observed.
   - Resolution_Likelihood (1-10): Is the issue definitively closed?
3. **Guardrails**: Be highly objective. Do not hallucinate sentences that were not in the transcript for the 'sentence_analysis'.

Analyze the following transcript:"""

    try:
        model = genai.GenerativeModel(model_name)
        
        # Guardrail: Enforce strict JSON schema at the API level
        generation_config = genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=AnalysisResult,
            temperature=0.1, # Low temperature for analytical consistency
        )
        
        response = model.generate_content(
            [system_prompt, text],
            generation_config=generation_config
        )
        
        # Because we used response_schema, the output is guaranteed to be valid JSON
        data = json.loads(response.text)
        return data
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Guardrail Failure: Model failed to return valid JSON.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def root():
    return {"status": "ok", "message": "Backend is running!"}
