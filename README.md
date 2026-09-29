# Atlasia AI

A ChatGPT-style AI assistant platform with specialized agents — chat, web search, coding, image generation, PDF/PPT generation, PDF RAG, and image analysis — built on a microservices backend with a credit-based billing system.

## Features

- **8 specialized AI agents** routed automatically via a LangGraph state machine
  - `chat` — general conversation assistant (Groq)
  - `search` — Tavily-powered web search that feeds context to the chat agent
  - `coding` — generates multi-file project artifacts (DeepSeek via OpenRouter) with Unsplash images
  - `vision` — AI image generation (pollinations.ai) stored on AWS S3
  - `pdf` / `ppt` — structured PDF (pdfkit) and PPTX (pptxgenjs) generation
  - `pdfRag` — RAG over uploaded PDFs (Qdrant vector search, no-hallucination prompt)
  - `imageAnalyzer` — upload an image for analysis/OCR with Gemini 2.5 Flash
- **Credit system** — per-agent credit costs, atomic debit, per-user plan limits
- **Monetization** — Razorpay checkout for Starter / Pro plans (30-day validity)
- **Chat history** — conversations & messages persisted to MongoDB, auto-naming from first prompt
- **React UI** — dark-themed 3-panel layout (sidebar / chat / code+preview artifact panel)

## Architecture

Microservices behind a single API gateway. Authentication is cookie/session-based: the gateway validates a Redis session, then propagates the `x-user-id` header to downstream services.

```
Browser (React :3000)
        │ session cookie
        ▼
  GATEWAY :8000  ── Redis (validate session-{id})
   ├── /api/auth/*    → AUTH    :8001  (Firebase login, sessions, plans, credits)
   ├── /api/chat/*    → CHAT    :8002  (conversations & messages)
   ├── /api/agent/*   → AGENT   :8003  (LangGraph agents, the "brain")
   ├── /api/billing/* → BILLING :8004  (Razorpay orders & verification)
   └── /api/me        → merges live plan/credits from AUTH
```

| Service | Port | Role |
|---|---|---|
| gateway | 8000 | Edge proxy; session validation; injects `x-user-id` |
| auth | 8001 | Firebase ID-token auth, Redis sessions, credit deduction, plans |
| chat | 8002 | Conversation/message persistence (MongoDB) |
| agent | 8003 | LangGraph orchestration of 8 sub-agents (Groq/Gemini/OpenRouter) |
| billing | 8004 | Razorpay order creation & signature verification |

External integrations: MongoDB (per-service DB), Redis (sessions / memory cache / rate limits), AWS S3 (generated files), Qdrant (PDF RAG), Tavily (web search), Unsplash (image URLs), Firebase (Google auth), Razorpay (payments).

## Tech Stack

- **Frontend:** React 19, Vite, Redux Toolkit, Tailwind CSS v4, Firebase Auth, react-markdown
- **Backend:** Node.js, Express 5, Mongoose, LangChain / LangGraph, ioredis
- **Infra:** Docker, Redis

## Getting Started

### Prerequisites

- Node.js 18+, MongoDB, Redis, Docker (for Redis)
- API keys: Groq, Gemini, OpenRouter, Tavily, Unsplash, AWS (S3), Qdrant, Razorpay, Firebase

### 1. Start Redis

```bash
cd backend
docker compose up -d
# Redis available at localhost:6380
```

### 2. Configure environment variables

Copy each `.env.example` to `.env` and fill in real values:

```bash
# backend/gateway
cp gateway/.env.example gateway/.env
cp services/auth/.env.example services/auth/.env
cp services/chat/.env.example services/chat/.env
cp services/agent/.env.example services/agent/.env
cp services/billing/.env.example services/billing/.env

# frontend
cp ../frontend/.env.example ../frontend/.env
```

For the auth service you must also place your Firebase Admin SDK private key at `services/auth/serviceAccountKey.json`
(the schema template is in `serviceAccountKey.example.json`).

### 3. Run the backend services

Each service is a standalone Express app (ESM). Run them in separate terminals:

```bash
cd backend/gateway && npm install && npm run dev   # :8000
cd backend/services/auth && npm install && npm run dev   # :8001
cd backend/services/chat && npm install && npm run dev   # :8002
cd backend/services/agent && npm install && npm run dev  # :8003
cd backend/services/billing && npm install && npm run dev # :8004
```

> `npm start` scripts use `node index.js`; the `dev` scripts use `nodemon`.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

## Plans & Credits

| Plan | Price | Credits | Validity |
|---|---|---|---|
| Free | ₹0 | 100 | 30 days |
| Starter | ₹199 | 500 | 30 days |
| Pro | ₹499 | 1000 | 30 days |

Credit cost per agent: `chat: 1`, `search: 5`, `coding: 10`, `pdf: 10`, `ppt: 10`, `vision: 10`. Deductions are atomic (`findOneAndUpdate` with a `credits >= cost` guard) to prevent double-spending under concurrency.

## License

Private project — no license.