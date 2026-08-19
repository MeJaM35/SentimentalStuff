# Agentic CX Sentiment Analyzer (POC)

An end-to-end full-stack application that analyzes customer support transcripts to extract actionable intelligence, sentiment flow, and derived Key Performance Indicators (KPIs) using Google's Gemini AI.

## Architecture

This project originally planned to use n8n for orchestration, but was upgraded to a direct **FastAPI** integration to enable strict API-level schema enforcement (guardrails) and Chain-of-Thought (CoT) reasoning.

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts.
- **Backend:** FastAPI (Python), `fastapi-users` (SQLite + JWT), Google Generative AI SDK.
- **AI Engine:** Google Gemini.

## Setup Instructions

### 1. Environment Variables
Ensure there is a `.env` file in the root of the project with your Gemini credentials:
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-3.7-flash
```

### 2. Start the Backend (FastAPI)
Open a terminal, navigate to the `backend` folder, and start the Python server:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*The backend will be running at `http://localhost:8000`.*

### 3. Start the Frontend (Next.js)
Open a new, separate terminal, navigate to the `frontend` folder, and start the Node server:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will be running at `http://localhost:3000`.*

## How to Use
1. Navigate to `http://localhost:3000` in your browser.
2. Enter **any** email and password. The mock authentication system will automatically register the credentials and log you in.
3. Upload a `.txt` file containing a conversation transcript (e.g., `Agent: ... \n Customer: ...`).
4. Wait a few seconds for the AI Agent to process the text, reason about the interaction, and populate the visual dashboard!
