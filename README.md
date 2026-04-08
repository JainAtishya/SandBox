# SandBox

SandBox is an AI-powered brand analysis and website generation platform that turns a business idea into a brand identity, design direction, and generated website content.

## What It Does

- Analyzes brand inputs such as business name, description, tone, and audience
- Generates Brand DNA and design decisions using AI
- Creates website sections like hero, features, testimonials, and CTA
- Visualizes personality, emotions, and audience personas
- Supports brand tuning and variation previews before final generation

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- AI: Google Gemini API
- HTTP: Axios
- Icons: Lucide React
- State: Zustand

## Project Structure

- client: React frontend
- server: Express API and AI services

## Features

- Brand analysis dashboard
- AI-generated brand DNA
- Design token generation
- Website content generation
- Emotion and personality visualization
- Brand tuning workflow
- Website preview and variations

## Requirements

- Node.js 18 or newer
- npm
- Google Gemini API key

## Setup

### 1. Clone the repository

git clone https://github.com/your-username/your-repo.git
cd SandBox

### 2. Install frontend dependencies

cd client
npm install

### 3. Install backend dependencies

cd ../server
npm install

### 4. Create the backend environment file

Create a file named .env inside the server folder and add:

GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001

## Running the App

### Start the backend

From the server folder:

node index.js

The backend runs on http://localhost:3001 and exposes:

- http://localhost:3001/api/health
- http://localhost:3001/api/website/generate

### Start the frontend

From the client folder:

npm run dev

The frontend uses the backend at http://localhost:3001/api.

## Available Scripts

### Client

- npm run dev: start the Vite development server
- npm run build: create a production build
- npm run lint: run ESLint
- npm run preview: preview the production build

### Server

- node index.js: start the Express API server

## API Overview

The frontend communicates with the backend through the service layer in [client/src/services/api.js](client/src/services/api.js).

Main generation flow:

- POST /api/website/generate
- Request body includes businessName, description, tone, and audience
- The backend generates Brand DNA, design tokens, reasoning, and website content

## Environment Variables

- GEMINI_API_KEY: required for AI generation
- PORT: optional, defaults to 3001

## Security

- Secrets are ignored through [.gitignore](.gitignore)
- Never commit API keys, .env files, or other private configuration

## Notes

- The backend uses fallback data when AI generation fails, so the app still renders useful output
- The frontend includes animated analysis sections and AI reasoning cards for a polished experience

