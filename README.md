# AI-Powered Workflow Automation System

## Overview
An AI-powered manufacturing digitization system designed to ingest, process, and digitize handwritten manufacturing logs using Google Gemini 2.5 Flash. It orchestrates complex document pipelines through Supabase Storage and flags records requiring manual validation based on intelligent confidence scoring and strict business rules.

## Architecture
```
[Next.js Frontend] <---(REST API)---> [FastAPI Backend]
       |                                   |
       v                                   v
  (User UI)                        [AI Orchestrator]
                                   /               \
                                  v                 v
                   [Gemini 2.5 Flash]    [Supabase (PostgreSQL & Storage)]
```

## Tech Stack
- **Backend**: Python 3.11, FastAPI, Pydantic
- **Frontend**: Next.js 14, React, Tailwind CSS, Tremor, Lucide
- **AI Core**: Google Generative AI (`gemini-2.5-flash`)
- **Database**: Supabase (PostgreSQL), Supabase Storage

## AI Workflow & Logic
The orchestration pipeline runs asynchronously:
1. **Ingestion**: File is uploaded to Supabase Storage and a `document` record is initialized (`status: processing`).
2. **Extraction**: The document is piped to Gemini 2.5 Flash via a rigid JSON-enforced prompt requesting value and confidence pairs for strictly mapped OCR fields.
3. **Automated Repair**: If the LLM generates invalid JSON, the orchestrator triggers an automatic repair loop prompt.
4. **Validation Logic**: 
    - If average confidence is `< 0.7`
    - OR if Work Order/Quantity confidence is `< 0.5`
    - OR if explicit business rules fail (e.g., Shift not in `1,2,3`)
    - **Result**: Record is flagged for manual review (`is_validated = false`).

## Setup

### Local Development
1. Clone this repository.
2. Initialize and configure `.env` (copy `.env.example` to `.env` and fill out your keys).
3. **Backend**:
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # (or .\venv\Scripts\activate on Windows)
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```
4. **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

### Docker
To spin up the entire orchestration pipeline:
```bash
docker-compose up --build
```
- API Docs: http://localhost:8000/docs
- Web App: http://localhost:3000
