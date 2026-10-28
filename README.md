# MailCraft AI – Smart Email Generator

> **College B.Tech Computer Science & Engineering Capstone / Mini-Project**  
> *An AI-powered, context-aware email generation platform built for students, teachers, job seekers, and corporate professionals.*

---

## 📌 Project Overview

**MailCraft AI** is a modern, responsive web application engineered to solve a pervasive communication challenge faced by undergraduate students and young engineers: drafting clear, contextually nuanced, etiquette-compliant emails for high-stakes academic and corporate situations.

Whether requesting a college lab deadline extension from a professor, applying for competitive software engineering internships, writing a polite sick leave request, or following up on an interview, MailCraft AI eliminates writer's block by generating subject lines and email bodies tailored to the recipient, purpose, tone, and language.

### Key Highlights
- **10 Dedicated Email Categories:** College Assignment, Leave Request, Job Application, Follow-up, Apology, Thank You, Formal Notice, Informal Collab, Professional Project Update, and Complaint.
- **6 Nuanced Tones:** Professional, Friendly, Polite, Persuasive, Casual, and Urgent.
- **Trilingual Communication:** Global English, standard Hindi (शुद्ध एवं मानक हिंदी), and conversational Hinglish.
- **Adjustable Length:** Short (concise, ~60 words), Medium (~150 words), and Detailed (~300 words with structured bullet points).
- **Dual AI Engine:** High-performance on-device dynamic NLP synthesis engine (runs 100% locally and offline without external dependencies) + pluggable cloud LLM integration (Google Gemini / OpenAI GPT-4o).
- **Interactive Live Workspace:** Edit generated email text in real-time, live word & character counters, reading time estimator, 1-click clipboard copy, and `.txt` file export.
- **Persistent History & Search:** Persistent storage via `localStorage` with SQLite backend synchronization, search filters, favorites, JSON export, and CSV export.
- **SaaS-Grade UI/UX:** Clean white background with deep navy blue (`#0F172A`) and royal purple (`#7C3AED`) accents, full Dark Mode support, glassmorphism cards, and fluid responsive design for desktop, tablet, and mobile.

---

## 🏗️ System Architecture

MailCraft AI is built with a decoupled, modular architecture supporting both static client-side execution and full-stack client-server interaction.

```
                      +---------------------------------------+
                      |         MailCraft AI Web App          |
                      |   (HTML5, Tailwind CSS, Lucide Icons) |
                      +-------------------+-------------------+
                                          |
                      +-------------------+-------------------+
                      |       Client Application Controller   |
                      |            (js/app.js)                |
                      +---------+-------------------+---------+
                                |                   |
             +------------------+                   +------------------+
             |                                                         |
+------------v------------+                               +------------v------------+
|  Dynamic NLP AI Engine  |                               |    Persistence Manager  |
|    (js/ai-engine.js)    |                               |     (js/history.js)     |
|  - Topic Parsing        |                               |  - LocalStorage Cache   |
|  - Semantic Synthesis   |                               |  - Search & Filters     |
|  - Trilingual Adapters  |                               |  - CSV/JSON Export      |
+------------+------------+                               +------------+------------+
             |                                                         |
             | (Optional API / Fallback)                               | (Optional Sync)
             v                                                         v
+-----------------------------------------------------------------------------------+
|                           Python 3 Backend Server                                 |
|                                (server.py)                                        |
|  +--------------------+   +-----------------------+   +------------------------+  |
|  |  Static Files Host |   |   REST API Endpoints  |   |    SQLite Database     |  |
|  |  (HTML, CSS, JS)   |   |   /api/generate       |   |      (mailcraft.db)    |  |
|  +--------------------+   |   /api/history        |   +------------------------+  |
|                           +-----------+-----------+                               |
+---------------------------------------|-------------------------------------------+
                                        | (If API keys configured)
                      +-----------------+-----------------+
                      |                                   |
           +----------v-----------+            +----------v-----------+
           |   Google Gemini API  |            |     OpenAI API       |
           |  (gemini-1.5-flash)  |            |    (gpt-4o-mini)     |
           +----------------------+            +----------------------+
```

---

## 💻 Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend UI** | HTML5 Semantic Markup, Tailwind CSS (via CDN), CSS3 Custom Variables, Lucide Icons |
| **Typography** | Plus Jakarta Sans, Inter, JetBrains Mono (Google Fonts) |
| **Client Scripting** | Vanilla JavaScript (ES6+), Modular Architecture, Web Storage API, Clipboard API |
| **Backend Runtime** | Python 3 (3.8+), Standard Library (`http.server`, `urllib.request`, `sqlite3`, `json`) |
| **Database** | SQLite 3 (`mailcraft.db`) for persistent local server-side records |
| **AI Integration** | Built-in Dynamic Semantic NLP Synthesizer + Optional Google Gemini / OpenAI API integration |
| **Design System** | Clean White & Slate background, Navy Blue (`#0F172A`), Indigo (`#4F46E5`), Purple (`#7C3AED`) |

---

## 📁 Project Directory Structure

```
college project/
├── index.html              # Main application SPA (Navbar, Hero, Generator, History, About, Modals)
├── css/
│   └── styles.css          # Custom styling, dark mode rules, glassmorphism, shimmer animations
├── js/
│   ├── ai-engine.js        # Dynamic multi-language AI generator & LLM API client
│   ├── examples.js         # Curated starter prompts library (College, Career, Corporate)
│   ├── history.js          # Persistent storage manager, search, filtering, JSON/CSV exports
│   └── app.js              # UI controller, routing, DOM event listeners, toast notifications
├── assets/
│   └── favicon.svg         # Brand vector icon with envelope and AI sparkle
├── server.py               # Zero-dependency Python 3 HTTP and REST API server with SQLite
├── .env.example            # Environment configuration template
├── .gitignore              # Standard git exclusion rules
└── README.md               # Comprehensive project documentation & viva guide
```

---

## 🚀 Quick Start & Setup Instructions

MailCraft AI requires **no complex installations, no package managers, and no node_modules**. It runs immediately on any operating system with Python 3.

### Method 1: Using the Python Backend Server (Recommended)

1. **Open Terminal or Command Prompt:**
   ```bash
   cd "college project"
   ```

2. **Start the server:**
   ```bash
   python3 server.py
   ```

3. **Open in your browser:**
   ```
   http://localhost:8000
   ```

*(The SQLite database `mailcraft.db` will be initialized automatically in the project folder.)*

---

### Method 2: Direct Static Browser Execution

Because MailCraft AI is designed with client-side resilience:
- Simply double-click `index.html` or open it with any web browser (Chrome, Safari, Firefox, Edge).
- All core features—including the dynamic AI engine, live editing, history persistence via `localStorage`, and file downloads—work completely offline.

---

## ⚙️ Environment Variables (Optional)

MailCraft AI is fully operational out-of-the-box in local dynamic generation mode. If you wish to demonstrate external cloud LLM integration during a project presentation:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your API keys (optional):
   ```env
   PORT=8000
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```
3. Restart `python3 server.py`.

> ⚠️ **Security Notice:** Never commit your actual `.env` file containing secret keys to GitHub. The `.gitignore` file already includes `.env` to prevent accidental leakage.

---

## 🔍 REST API Documentation

The included `server.py` provides clean REST API endpoints for integration testing and external consumers:

| Method | Endpoint | Description | Request Payload | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status | None | `{"status": "healthy", "version": "2.0.0"}` |
| `POST` | `/api/generate` | Generate email draft | `{topic, recipient, emailType, tone, language, length}` | `{"subject": "...", "body": "...", "source": "..."}` |
| `GET` | `/api/history` | Retrieve saved emails | None | `{"items": [...], "count": N}` |
| `POST` | `/api/history` | Save/Sync email draft | `{id, subject, body, topic, ...}` | `{"status": "saved", "id": "..."}` |
| `DELETE`| `/api/history/<id>` | Delete an email by ID | None | `{"status": "deleted", "id": "..."}` |
| `DELETE`| `/api/history` | Clear all saved history | None | `{"status": "cleared"}` |

---

## 📤 Exporting & Syncing to GitHub

To push this project to your personal or college GitHub repository, follow these standard steps:

1. **Initialize Git repository:**
   ```bash
   cd "college project"
   git init
   ```

2. **Stage all project files:**
   ```bash
   git add .
   ```

3. **Create the initial commit:**
   ```bash
   git commit -m "feat: complete MailCraft AI smart email generator project"
   ```

4. **Link to your GitHub remote repository:**
   ```bash
   git remote add origin https://github.com/<your-username>/mailcraft-ai.git
   ```

5. **Rename branch to main and push:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

---

## 🎓 Academic Viva & Evaluation Q&A (B.Tech Defense Guide)

### 1. What problem does MailCraft AI solve?
> Undergraduates and entry-level professionals often struggle with appropriate workplace etiquette, formatting norms, and linguistic confidence when communicating with faculty, recruiters, and managers. MailCraft AI acts as an intelligent communication co-pilot, translating raw thoughts into well-structured, professional correspondence in seconds.

### 2. How does the generation engine work without relying on static templates?
> Instead of simple hardcoded string replacement, the MailCraft dynamic synthesis engine analyzes the user's topic to extract contextual intent, urgency, and core deliverables. It dynamically composes context-specific subject lines, tailored greetings based on recipient hierarchy, structured body arguments, situation-specific calls to action, and professional sign-offs.

### 3. How does the application ensure data privacy?
> All generation and history persistence can operate 100% on the user's local machine using client-side heuristics and browser `localStorage`. No user emails or sensitive inputs are sent to third parties unless the user explicitly enters their personal API credentials.

### 4. What are the advantages of zero-dependency Python backend?
> By leveraging Python's standard library modules (`http.server`, `sqlite3`, `urllib`), any evaluator, teacher, or colleague can run the server on macOS, Windows, or Linux with a single terminal command without encountering version mismatches or broken `npm install` steps.

---

## 👥 Contributors & Academic Credits

- **Project Name:** MailCraft AI – Smart Email Generator
- **Course:** Bachelor of Technology (B.Tech) – Computer Science & Engineering
- **Academic Year:** 2025–2026

---

## 📄 License
This project is open-source under the [MIT License](https://opensource.org/licenses/MIT).
