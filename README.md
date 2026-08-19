# Sentimental Stuff (POC)

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

### 2. Start the Application (Docker Compose)
The easiest way to run the entire Full-Stack application is using Docker. Ensure you have Docker and Docker Compose installed, then run from the root directory:

```bash
docker compose up --build
```

Docker will automatically build the Next.js frontend and the FastAPI backend concurrently.
* The frontend UI will be available at `http://localhost:3000`.
* The API will be available at `http://localhost:8000`.

*(Note: If you update `package.json` in the future and Next.js fails to compile, run `docker compose down -v` to clear the cached volumes before building again).*

## How to Use
1. Navigate to `http://localhost:3000` in your browser.
2. Enter **any** email and password. The mock authentication system will automatically register the credentials and log you in.
3. Upload a `.txt` file containing a conversation transcript (e.g., `Agent: ... \n Customer: ...`).
4. Wait a few seconds for the AI Agent to process the text, reason about the interaction, and populate the visual dashboard!
