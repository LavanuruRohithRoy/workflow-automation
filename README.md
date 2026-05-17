# AI-Powered Industrial Digitization Engine

## Live Production Link
- **Frontend (Vercel)**: [https://workflow-automation-api.vercel.app](Live Demo)

## 1. Project Overview
This system is an end-to-end automation pipeline designed to digitize handwritten manufacturing logs. It utilizes Gemini 2.5 Flash to transform unstructured visual data into structured, relational records with an Intelligent Repair Loop for high data integrity.

## 2. Technical Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Shadcn/UI, Tremor (Analytics).
- **Backend**: FastAPI (Python 3.11), Asynchronous Background Tasks.
- **AI Orchestration**: Gemini 2.5 Flash via google-genai SDK.
- **Database & Storage**: Supabase (Postgres & S3-compatible Buckets).
- **Infrastructure**: Docker Multi-stage builds, GitHub Actions CI/CD.

## 3. Core Engineering Features
- **Multi-Record Extraction**: Automatically identifies and splits multiple log entries from a single document image into individual database rows.
- **Intelligent Repair Loop**: A self-healing mechanism that detects malformed JSON from the LLM and re-triggers specific "Repair Prompts" to ensure structural validity.
- **Confidence-Driven UI**: Visual highlighting of low-confidence fields (< 0.7 score) to facilitate efficient human-in-the-loop verification.
- **Industrial Insights**: Real-time production analytics (Quantities by Shift, Success Rates, Machine Performance) visualized via interactive Tremor charts.

## 4. Local Setup & Installation
```bash
# 1. Clone the repository
git clone https://github.com/LavanuruRohithRoy/workflow-automation.git

# 2. Configure Environment Variables
# Create .env in /backend and /frontend based on the provided .env.example

# 3. Spin up the full stack via Docker
docker-compose up --build
```
