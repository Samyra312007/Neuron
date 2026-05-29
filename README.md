# NEURON — Organizational Nervous System

An AI-powered multi-agent platform that reveals hidden organizational dynamics.

## Features

### Agent Dashboard
- **Genome Lab** — 6-gene health sequencing (collaboration, decision-making, knowledge flow, innovation, resilience, vitality) with D3 helix viz & comparison overlay
- **Dark Matter Detector** — Detect invisible work: unlogged hours, shadow coordination, meeting overhead, context switching with D3 treemap & drill-down
- **Immune Center** — Organizational infection detection, severity/duration tracking, treatment recommendations with D3 bubble chart, auto-polling, treatment flow
- **Metabolic Rate** — Energy/resource flow analysis with D3 speedometer gauge & waterfall chart
- **Cognitive Load** — Team cognitive capacity heatmap & overload analysis
- **Ripple Simulator** — "What-if" scenario modeling: predict cascading effects of decisions across teams
- **Fossil Record** — Historical org snapshots with timeline slider, before/after diff, crisis pattern matching warnings

### Core Platform
- **Activity Feed** — Real-time agent detection, infection, and snapshot event stream with type filtering & load-more
- **Alert System** — Configurable metric thresholds with real-time evaluation
- **Team-level Filtering** — Dropdown to filter all pages by specific team (persisted in localStorage)
- **Benchmark Comparison** — Compare metrics vs industry averages in a table
- **Settings Page** — Full config: org name, notification prefs, webhook URLs, SMTP, alert rules, GitHub connector, data export/import
- **Dark Mode** — Sidebar toggle with localStorage persistence

### Advanced Analytics
- **Crisis Pattern Matching** — 4 predefined patterns (Collaboration Collapse, Burnout Cascade, Meeting Metastasis, Decision Paralysis) with match scoring on Fossil snapshots
- **Knowledge Vulnerability** — Communication centrality analysis revealing single points of failure
- **Decision Archaeology** — Track decisions from proposals through completion/reversal with auto-discovery from events
- **NLP Sentiment Analysis** — Sentiment trends & breakdowns from synthetic communication data

### Integration & Data
- **GitHub Connector** — Ingest commit patterns, PR size, review cycles as team data
- **Notification Channels** — Slack & Discord webhook integration
- **Email Reports** — SMTP-based PDF report delivery
- **Data Export/Import** — Full JSON backup & CSV team import
- **Multi-Org Support** — Org switcher with isolated data per organization
- **Export All Report** — Single PDF bundling all sections

### Auth & Users
- JWT-based authentication (register/login)
- Org-scoped data isolation
- Protected routes

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Metric cards, benchmark table, activity feed, sentiment, export-all, auto-polling |
| Genome Lab | `/genome` | DNA helix viz, analysis, history comparison |
| Dark Matter | `/dark-matter` | Treemap with drill-down detail panel |
| Immune Center | `/immune` | Bubble chart, infection list, treatment |
| Metabolic Rate | `/metabolic` | Speedometer gauge, waterfall chart |
| Cognitive Load | `/cognitive-load` | Heatmap with overload indicators |
| Ripple Simulator | `/ripple` | What-if scenario modeling |
| Fossil Record | `/fossil` | Timeline slider, before/after diff, crisis warnings |
| Vulnerability | `/vulnerability` | Knowledge single-point-of-failure analysis |
| Decisions | `/decisions` | Decision lifecycle with auto-discovery |
| Activity | `/activity` | Full event stream with type filter |
| Settings | `/settings` | All platform configuration |
| Login | `/login` | Register/Login with JWT |

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

Mock AI mode is enabled by default (`MOCK_AI=true`) so the platform works without a GPU or API key.

## Architecture

```
Frontend (React + D3.js) → FastAPI (Agents/API) → PostgreSQL + Redis
                                                     ↕
                                           NVIDIA NIM API (optional)
```

**4 Docker services:** frontend, backend, postgres, redis

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy (async), PostgreSQL, Python 3.12, Alembic
- **AI:** NVIDIA NIM (Llama 3.3 70B) with mock fallback
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, D3.js v7, React Query
- **Infra:** Docker Compose, Redis

## API Docs

Once running: http://localhost:8000/docs

### Notable Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /agents/run-all` | Execute all 8 agents simultaneously |
| `GET /export-all/pdf` | Full org report as PDF |
| `GET /export-all/json` | Full org backup as JSON |
| `POST /import/teams` | Upload CSV to seed teams |
| `POST /auth/register` | Create account |
| `POST /auth/login` | Get JWT token |
| `POST /github/ingest` | Fetch GitHub commits & PRs |
| `POST /notifications/test-webhook` | Test Slack/Discord webhook |
| `POST /email-reports/send` | Send PDF report via SMTP |
| `POST /crisis/seed-patterns` | Seed crisis patterns for matching |
| `POST /decisions/auto-discover` | Auto-discover decisions from events |

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| `MOCK_AI` | `true` | Use mock AI responses (no GPU needed) |
| `NVIDIA_NIM_API_KEY` | — | Real NIM API key |
| `DATABASE_URL` | `postgresql+asyncpg://...` | PostgreSQL connection |
| `JWT_SECRET` | `neuron-secret-key-change-in-prod` | JWT signing secret |

## Database

19 SQLAlchemy models across 4 Alembic migrations:

- Organizations, Teams, People
- Raw Events, Genome Sequences, Dark Matter Reports
- Metabolic Metrics, Immune Infections, Cognitive Load Metrics
- Fossil Snapshots, Infection Events, Activity Events
- Alert Configurations, Alert History, Organization Settings
- Crisis Patterns, Crisis Matches, Decision Records, Users
