# Deployment Guide

This guide outlines the optimal strategy for deploying the AI-Powered Workflow Automation System for free using modern PaaS providers.

## Backend (Render or Railway)
The backend is a stateless FastAPI application that communicates with Supabase. 

1. **Railway Setup**:
   - Create a new project on Railway.app.
   - Connect your GitHub repository.
   - Set the root directory to `/backend`.
   - Railway will automatically detect the Dockerfile.
   - Add your Environment Variables (`SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`).
   - Deploy.

## Frontend (Vercel)
Vercel is the creator of Next.js and provides the best hosting experience.

1. **Vercel Setup**:
   - Create a new project on Vercel.com.
   - Connect your GitHub repository.
   - Set the Root Directory to `frontend`.
   - Set the Build Command to `npm run build` and Install Command to `npm install`.
   - Add your Environment Variable: `NEXT_PUBLIC_API_URL` pointing to your Railway Backend URL (e.g., `https://backend-production.up.railway.app/api/v1`).
   - Deploy.

## Database (Supabase)
Your Supabase instance is already live. Ensure that the CORS settings in your Supabase project allow traffic from your Vercel frontend URL.
