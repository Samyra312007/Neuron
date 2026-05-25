# 🧬 NEURON — Organizational Nervous System

An AI-powered multi-agent platform that reveals hidden organizational dynamics. Built for a 5-day hackathon.

## Features

| Feature | Description |
|---------|-------------|
| **Genome Lab** | 6-gene health sequencing (collaboration, decision-making, knowledge flow, innovation, resilience, vitality) |
| **Dark Matter Detector** | Detect invisible work: unlogged hours, shadow coordination, meeting overhead, context switching |
| **Immune Center** | Organizational infection detection & treatment recommendations |

## Quick Start

```bash
# 1. Copy environment file and add your NVIDIA NIM API key
cp .env.example .env
# Edit .env: set NVIDIA_NIM_API_KEY=nvapi-...

# 2. Start all services
docker-compose up --build

# 3. Open in browser
open http://localhost:5173
```

## Architecture

```
Frontend (React + D3.js) → FastAPI (Agents) → NVIDIA NIM API
                              ↕
                         PostgreSQL
```

## API Docs

Once running: http://localhost:8000/docs

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, Python 3.12
- **AI:** NVIDIA NIM (Llama 3.3 70B)
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, D3.js
- **Infra:** Docker Compose
