# 🦉 Nexora AI

**AI-Powered Company Intelligence & Strategic Decision Platform**

Nexora AI is an enterprise-grade intelligence platform that transforms public data into executive intelligence. By leveraging a multi-agent AI architecture and real-time crawling across 8+ premium data sources, Nexora synthesizes financial data, maps competitors, and builds a comprehensive RAG (Retrieval-Augmented Generation) knowledge base for any company in seconds.

---

## 🌟 Key Features

- **Automated Intelligence Gathering**: Enter a company name or website, and Nexora crawls Wikipedia, Crunchbase, GitHub, News, HackerNews, Reddit, ProductHunt, and financial databases.
- **Multi-LLM Architecture**: Intelligent routing between high-tier models (Gemini 3.1 Pro, Llama 3) for specialized tasks like financial synthesis, threat assessment, and strategic recommendations.
- **Interactive Executive Dashboard**: A beautiful, responsive, widget-based dashboard showcasing health scores, SWOT analysis, revenue tracking, and competitor matrices.
- **Interactive AI Assistant**: A globally available, floating AI assistant that can answer deep strategic questions about any analyzed company using a robust RAG vector database (ChromaDB).
- **Export Capabilities**: Seamlessly export reports to PDF and Raw JSON.

---

## 🏗️ System Architecture

Nexora AI is built on a modern, decoupled architecture:

### Frontend
- **Framework**: Next.js 14+ (React)
- **Styling**: Tailwind CSS & Framer Motion
- **Data Visualization**: Recharts
- **Design System**: Custom Nexora Enterprise UI

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (Job Store & Application State)
- **Vector Store**: ChromaDB for RAG implementation
- **AI Orchestration**: Custom Multi-Agent Pipeline (Analyst -> Critic -> Polisher)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- API Keys: 
  - `GROQ_API_KEY`
  - `GEMINI_API_KEY`
  - `NVIDIA_API_KEY`
  - `TAVILY_API_KEY` (Optional for advanced search)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -e .
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ License

Copyright © 2026 Nexora AI. All rights reserved.
This project is proprietary and confidential. Unauthorized copying, modification, or distribution is strictly prohibited.
