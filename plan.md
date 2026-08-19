Project Plan: Sentiment Analyzer (Full-Stack + AI)
Prepared for Development in Google Antigravity (Gemini 3.1 Pro Agent)

1. Project Overview & Architecture
This project is an end-to-end full-stack application that allows users to upload conversation transcripts (text files), analyzes them using AI for sentiment (overall and sentence-level), and visualizes the results alongside relevant Key Performance Indicators (KPIs) via a modern web dashboard.

Target Architecture:
Frontend: React / Next.js (Tailwind CSS for styling) deployed on Vercel/Netlify.
Backend/Automation: FastAPI (Python) using the `fastapi-users` library for authentication and routing.
AI Engine (App Logic): OpenRouter API, utilizing a free, fast Chinese model for reasoning, sentiment extraction, and summarization. (Note: The specific free model will be selected based on the latest OpenRouter availability).
Flow: React UI (Login/Upload) -> FastAPI Backend -> OpenRouter API Call -> FastAPI Backend Response -> React UI (Dashboard).

2. Feature Requirements
Frontend (React/Next.js)
Authentication: Basic login screen interacting with the FastAPI backend for JWT-based auth.
Upload Interface: Drag-and-drop or standard file input specifically for .txt files containing conversation logs.
Results Dashboard (The Core UI):
Overall Sentiment: Clear visual indicator (Positive / Negative / Neutral).
Sentence-Level Sentiment: A breakdown/table showing individual sentences alongside their detected sentiment.
Data Visualization: Charts (e.g., Pie chart for sentiment distribution over the conversation, Line chart for emotion flow).
AI Insights: A conversational summary box.
KPI Section: Display derived metrics relevant to a phone call (e.g., Agent Empathy Score, Customer Frustration Index, Resolution Likelihood).

Backend / Orchestration (FastAPI)
Authentication: Implement authentication using the `fastapi-users` library with a SQLite database to manage user sessions and issue JWT tokens.
File Processing: Set up a protected endpoint (`POST /analyze`) to receive the multipart form-data (the .txt file) and extract the text content.
AI Agent / Logic:
Utilize Python (`requests` or `openai` SDK) to send the text to the chosen free OpenRouter model.
Prompt the AI to:
Determine overall sentiment.
Perform sentence-by-sentence analysis.
Identify specific emotions (anger, joy, frustration).
Generate a concise conversation summary.
Extract relevant call center KPIs.
Structured Response: Ensure the FastAPI endpoint returns a strictly structured JSON response back to the frontend to populate the dashboard.

3. Step-by-Step Prompting Plan for Antigravity
To execute this build in Antigravity, copy and paste the following prompts sequentially to the Gemini 3.1 Pro developer agent.

Stage 1: Setup Backend and Auth
Prompt 1 (Backend Setup):
"I am building a 'Sentiment Analyzer' web app. Please initialize a new FastAPI project in a 'backend' folder. Set up authentication using the `fastapi-users` library with a local SQLite database and JWT transport. Create the standard login and registration endpoints."

Stage 2: Setup Frontend and Login
Prompt 2 (Frontend Setup):
"Please initialize a new Next.js project using Tailwind CSS in a 'frontend' folder. Create a modern login screen that authenticates against the FastAPI `/login` endpoint and stores the JWT securely. Once authenticated, route the user to an empty dashboard page. Ensure the UI is clean and modern."

Stage 3: File Upload & Backend AI Integration
Prompt 3 (Upload Component & API):
"On the Next.js dashboard page, build a file upload component that accepts only .txt files. It should send the file via a POST request to a protected FastAPI endpoint `/analyze` with the JWT as a Bearer token. On the FastAPI side, implement this endpoint to accept the file, extract its text, and make a call to the OpenRouter API using a chosen free model. Use this system prompt for the AI: 'You are an expert customer service analyst. Output your analysis in strictly valid JSON format with keys: overall_sentiment, summary, emotions, sentence_analysis, and kpis'. Ensure the FastAPI endpoint returns this JSON back to the frontend."

Stage 4: Dashboard Visualization
Prompt 4 (Dashboard UI Generation):
"Update the dashboard page to handle the JSON response from our backend. Use Recharts to build a pie chart showing the distribution of positive, negative, and neutral sentences. Build a visually appealing section to display the 3 KPIs using progress bars or scorecards. Create a clean list or table showing the sentence-by-sentence breakdown. Display the overall summary and tags for the detected emotions. Ensure the UX is highly polished."

4. Evaluation KPIs Checklist (For Final Review)
Before submitting, ensure the project meets these grading criteria defined in the assignment:
[ ] AI Quality: Is the sentiment logical? (Test with obvious angry vs. happy transcripts).
[ ] Architecture: Is the separation of concerns clear? (React handles UI/Upload; FastAPI handles Auth/API; OpenRouter handles AI).
[ ] UX/UI: Is the dashboard readable and clean?
[ ] Creativity: Are the charts, emotion tags, and chosen phone call KPIs engaging and well-presented?
