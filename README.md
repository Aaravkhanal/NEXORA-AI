<div align="center">
  <img src="ChatGPT%20Image%20Jul%2031%2C%202026%20at%2011_29_09%20AM.png" alt="Nexora AI Logo" width="250"/>
  <h1>🦉 Nexora AI</h1>
  <p><strong>AI-Powered Company Intelligence & Strategic Decision Platform</strong></p>
</div>

---

## 🧐 What does this project do exactly?

Nexora Intelligence is an AI-powered company intelligence platform that researches businesses, analyzes competitors, generates SWOT and financial insights, builds interactive dashboards, and provides source-backed reports with an AI assistant powered by RAG and multi-LLM workflows.

Traditionally, understanding a company's market position, financial health, technology stack, and competitors requires hours of manual web scraping, reading Wikipedia articles, analyzing Crunchbase data, and sifting through recent news. 

Nexora AI automates this entire process. You simply input a company name or website URL, and Nexora orchestrates a swarm of AI agents to:
1. **Crawl** the web across 8 premium data sources in parallel.
2. **Synthesize** the unstructured data into structured intelligence (financials, SWOT, products).
3. **Generate** a beautiful, interactive executive dashboard.
4. **Build** a dedicated RAG (Retrieval-Augmented Generation) knowledge base, allowing you to chat with an AI assistant to ask deep, strategic questions about the company.

---

## 🔄 How it Works (The Flow)

Nexora AI utilizes a highly optimized, decoupled architecture (FastAPI Backend + Next.js Frontend) to deliver intelligence in seconds.

### 1. User Input & Discovery
The user enters a company name (e.g., "Stripe") or a website (e.g., "https://stripe.com"). The backend's AI Router identifies the correct entity, normalizes the name, and initiates the research job.

### 2. Parallel Data Crawling
Using Python's `asyncio` and LangChain's `RunnableParallel`, Nexora simultaneously fires off retrievers to gather raw data from:
- **Wikipedia** (History, general overview)
- **Crunchbase / Financial APIs** (Funding, revenue, leadership)
- **GitHub** (Open source presence, technology stack)
- **News APIs** (Recent mentions, sentiment analysis)
- **HackerNews & Reddit** (Public perception, developer sentiment)
- **ProductHunt** (Product launches)
- **Official Website** (Direct web crawling and scraping)

### 3. Multi-Agent Synthesis
The raw data is fed into a **Multi-LLM Pipeline** (orchestrating models like Gemini 3.1 Pro and Llama 3 via Groq). The pipeline uses specialized agents:
- **The Analyst**: Extracts hard metrics (revenue, employees, tech stack).
- **The Critic**: Identifies risks, threats, and competitor advantages.
- **The Polisher**: Formats the intelligence into a cohesive executive summary, SWOT matrix, and health scores.

### 4. Vector Knowledge Base (RAG)
As the data is synthesized, it is simultaneously chunked and embedded into a local **ChromaDB Vector Store**. This creates a persistent knowledge base for that specific company.

### 5. Interactive Dashboard & Assistant
The frontend (built with Next.js and Tailwind CSS) polls the SQLite job store via Server-Sent Events (SSE). Once the data is ready, it renders an interactive dashboard featuring:
- **Interactive Widgets**: Health scores, funding timelines, and market narratives.
- **Competitor Matrices**: Side-by-side feature comparisons.
- **Floating AI Assistant**: A globally available chat widget. When you ask a question (e.g., *"What is their biggest weakness?"*), the assistant queries the ChromaDB vector store to provide highly accurate, cited answers based *only* on the retrieved data.

---

## 🏗️ System Architecture

- **Frontend**: Next.js 14+, Tailwind CSS, Framer Motion, Recharts, Custom Nexora Enterprise UI.
- **Backend**: FastAPI (Python), SQLite (Job & State Store), ChromaDB (Vector Store).
- **AI Engine**: LangChain, Multi-Agent Routing (Gemini API, Groq).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- API Keys: `GROQ_API_KEY`, `GEMINI_API_KEY`, `NVIDIA_API_KEY`, `TAVILY_API_KEY` (Optional)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e .
cp .env.example .env      # Add your API keys to .env
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ License

Copyright © 2026 Nexora AI. All rights reserved.
This project is proprietary and confidential. Unauthorized copying, modification, or distribution is strictly prohibited.
