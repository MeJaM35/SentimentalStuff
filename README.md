# Sentimental Stuff (POC)

An end-to-end full-stack application that analyzes customer support transcripts to extract actionable intelligence, sentiment flow, and derived Key Performance Indicators (KPIs).

## Architecture & How It Works

This application is built on a modern containerized stack, utilizing a Next.js 14 frontend and a FastAPI backend. The core intelligence of the platform is driven by a highly robust, native **Agentic Orchestration** layer built directly into the Python code.

### 1. Code-Based Agentic Orchestration (Fully Implemented)
The native FastAPI backend is fully operational and orchestrates multiple AI agents to ensure secure, high-quality analysis:
- **Pre-Generation Input Guardrail:** Before the transcript is analyzed, a fast, lightweight evaluation model scans the input. If it detects a prompt injection (e.g., "ignore previous instructions") or a jailbreak attempt, it halts execution and returns a `400 Bad Request`.
- **Generation & Structured Output:** Powered by LiteLLM and the `instructor` library, the primary generation model strictly enforces the Pydantic schema, guaranteeing that the dashboard receives perfectly formatted JSON containing the sentiment breakdown, emotions, and KPIs.
- **QA Self-Correction Reflection Loop:** The platform utilizes a "Judge" agent. Once the generation agent outputs the JSON, the Judge agent evaluates it against a rubric on a scale of 1-10. If the score falls below a user-defined threshold, the agent is forced into a reflection loop, taking the feedback and re-generating its response up to 3 times until it achieves a passing score.
- **Post-Generation Output Guardrail:** Finally, a hallucination checker ensures that the quotes extracted in the "sentence_analysis" actually exist in the original transcript.

### 2. Experimental n8n Orchestration (Beta / WIP)
> ⚠️ **Note on n8n Integration:** We are currently experimenting with an alternative visual orchestration pipeline using **n8n**. This beta workflow is provided in the repository as a JSON blueprint (`workflow/n8n_sentiment_pipeline.json`). It maps out the exact same guardrail and generation logic using native HTTP nodes. However, **this n8n integration is not fully implemented yet**. 
> Regardless of the n8n beta status, the application is 100% fully functional using the native Python agentic orchestration!

## Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS, Recharts.
- **Backend:** FastAPI (Python), Instructor, LiteLLM, SQLite + JWT.
- **Model Routing:** Agnostic (Currently configured for Groq / OpenAI 120b models).

## Setup Instructions

### 1. Environment Variables
Copy the provided `.env.example` file to create your own `.env` file in the root of the project:
```bash
cp .env.example .env
```
Ensure you fill in your API credentials (e.g., Groq, Gemini) inside the `.env` file.

### 2. Start the Application (Docker Compose)
The easiest way to run the entire Full-Stack application is using Docker. Ensure you have Docker and Docker Compose installed, then run from the root directory:

```bash
docker compose up --build -d
```

Docker will automatically build the Next.js frontend and the FastAPI backend concurrently.
* The frontend UI will be available at `http://localhost:3000`.
* The API will be available at `http://localhost:8000`.

*(Note: If you update `package.json` in the future and Next.js fails to compile, run `docker compose down -v` to clear the cached volumes before building again).*

## How to Use
1. Navigate to `http://localhost:3000` in your browser.
2. Enter **any** email and password. The mock authentication system will automatically register the credentials and log you in.
3. Upload a `.txt` file containing a conversation transcript, or click one of the quick-load sample buttons (e.g., "Angry Billing Issue").
4. Wait a few seconds for the AI Agent to process the text, reason about the interaction through its reflection loop, and populate the visual dashboard! You can also export the final report directly to PDF.
