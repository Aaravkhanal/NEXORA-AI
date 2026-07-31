# 🧠 Nexus Intelligence

**Enterprise AI Company Intelligence Platform**

> Research any company in seconds. Comprehensive AI-generated intelligence reports, financial insights, competitor analysis, technology stack detection, and a RAG-powered interactive chatbot — all powered by Google Gemini.

![Nexus Intelligence](https://img.shields.io/badge/Nexus-Intelligence-6366F1?style=for-the-badge&logo=brain&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-RAG-FF6B6B?style=for-the-badge)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔍 **Multi-Source Research** | Wikipedia, GitHub, News APIs, Yahoo Finance, Web Crawling |
| 🤖 **AI Report Generation** | 8 parallel LLM chains synthesizing all data into structured sections |
| 💬 **RAG Chatbot** | ChromaDB vector store + semantic search + citation-backed answers |
| 📊 **Interactive Charts** | Revenue trends, competitor radar, language distribution |
| ⚡ **Real-time Progress** | Server-Sent Events for live pipeline updates |
| 🏢 **Competitor Analysis** | Auto-identified competitors with SWOT and comparison tables |
| 🛠️ **Tech Stack Detection** | Infers frontend, backend, databases, cloud providers |
| 💰 **Financial Intelligence** | Revenue estimates, funding rounds, market cap, growth rates |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Google Gemini API Key ([get one free](https://aistudio.google.com))

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -e .

# Configure your API keys
cp .env.example .env
# Edit .env and add at minimum: GEMINI_API_KEY=your_key_here

# Start the API server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`  
Interactive docs: `http://localhost:8000/api/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:3000` 🎉

---

## 🔑 API Keys

| Key | Required? | Get It | Purpose |
|-----|-----------|--------|---------|
| `GEMINI_API_KEY` | ✅ **Required** | [aistudio.google.com](https://aistudio.google.com) | LLM + Embeddings |
| `GITHUB_TOKEN` | Recommended | GitHub Settings → Tokens | Higher rate limits for tech stack |
| `NEWS_API_KEY` | Recommended | [newsapi.org](https://newsapi.org) | Recent news (100 req/day free) |
| `ALPHA_VANTAGE_KEY` | Optional | [alphavantage.co](https://alphavantage.co) | Financial data |
| `OPENAI_API_KEY` | Optional | [platform.openai.com](https://platform.openai.com) | Alternative LLM to Gemini |

---

## 🏗️ Architecture

```
nexus-intelligence/
├── backend/                     FastAPI Python API
│   └── app/
│       ├── api/routes/          REST endpoints (research, report, chat, progress)
│       ├── core/                Config, logging
│       ├── db/                  ChromaDB vector store + in-memory job store
│       ├── models/              Pydantic schemas (25+ models)
│       └── services/
│           ├── ai/              LLM client, RAG engine, report generator
│           ├── crawlers/        Async web crawler + content extractor
│           ├── retrievers/      Wikipedia, GitHub, News, Finance
│           └── report/          Pipeline orchestrator
└── frontend/                    Next.js 14 App Router
    ├── app/
    │   ├── page.tsx             Landing / search hero
    │   └── report/[id]/         Full intelligence report + chat
    └── lib/
        └── api.ts               Typed API client
```

### Data Flow

```
User Input → POST /api/research → Job Created
     ↓
GET /api/progress/{id} (SSE) ← Real-time updates
     ↓
Parallel: Wikipedia + GitHub + News + Finance + Web Crawl
     ↓
Chunk + Embed → ChromaDB (RAG knowledge base)
     ↓
8 parallel LLM chains → Structured report sections
     ↓
GET /api/report/{id} → Full CompanyReport JSON
     ↓
POST /api/chat/{id} → Semantic search + LLM → Answer + Citations
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/research` | Start a company research job |
| `GET` | `/api/job/{id}` | Get job status |
| `GET` | `/api/progress/{id}` | SSE progress stream |
| `GET` | `/api/report/{id}` | Get full intelligence report |
| `POST` | `/api/chat/{id}` | Chat with RAG chatbot |
| `GET` | `/api/chat/{id}/history` | Get conversation history |
| `GET` | `/api/health` | Health check |

---

## 🎨 UI Highlights

- **Dark glassmorphism** design with gradient accents
- **Sidebar navigation** with scroll-spy active states
- **Score rings** for AI-generated intelligence scores
- **SWOT matrix** with color-coded quadrants
- **Competitor radar chart** for visual benchmarking
- **Tech stack tags** color-coded by category
- **Floating chat panel** with source citations
- **Real-time progress** with animated step tracker

---

## 🧪 Development

```bash
# Backend tests
cd backend && pytest tests/ -v

# Frontend build check
cd frontend && npm run build

# Full type check
cd frontend && npx tsc --noEmit
```

---

## 📁 Original Repository

This project was originally forked from a LangChain `RunnableParallel` research demo (Wikipedia + GitHub retriever) and has been completely redesigned and rebuilt as an enterprise AI platform. The original LangChain parallel execution pattern has been preserved and extended in the new pipeline architecture.

---

## 📄 License

MIT
