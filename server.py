#!/usr/bin/env python3
"""
MailCraft AI - Backend Server (Python 3 Standard Library)
==========================================================
Provides:
1. Static web server for modern frontend SPA (HTML, CSS, JS, SVG)
2. REST API endpoints:
   - POST /api/generate (LLM proxy via Gemini/OpenAI or dynamic local synthesis)
   - GET /api/history (Persistent SQLite retrieval)
   - POST /api/history (Persistent SQLite storage)
   - DELETE /api/history/<id> (Delete item)
   - DELETE /api/history (Clear history)
   - GET /api/health (Server status)

Zero external dependencies required. Runs out-of-the-box on standard Python 3.8+.
"""

import os
import sys
import json
import sqlite3
import mimetypes
import urllib.request
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime

# --------------------------------------------------------------------------
# Configuration & Lightweight .env Loader
# --------------------------------------------------------------------------
PORT = int(os.environ.get('PORT', 8000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, 'mailcraft.db')

def load_env_file():
    env_path = os.path.join(BASE_DIR, '.env')
    if os.path.exists(env_path):
        try:
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if k not in os.environ:
                            os.environ[k] = v
        except Exception as e:
            print(f"[Warning] Could not parse .env file: {e}")

load_env_file()

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

# --------------------------------------------------------------------------
# SQLite Database Setup
# --------------------------------------------------------------------------
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS emails (
            id TEXT PRIMARY KEY,
            subject TEXT,
            body TEXT,
            topic TEXT,
            recipient TEXT,
            custom_recipient TEXT,
            email_type TEXT,
            tone TEXT,
            language TEXT,
            length TEXT,
            is_favorite INTEGER DEFAULT 0,
            created_at TEXT,
            updated_at TEXT,
            source TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --------------------------------------------------------------------------
# Server-side Dynamic Heuristic AI Engine (Fallback & Zero-Config Mode)
# --------------------------------------------------------------------------
def synthesize_server_email(params):
    topic = params.get('topic', '').strip()
    recipient = params.get('recipient', 'Colleague')
    custom_recipient = params.get('customRecipient', '').strip()
    email_type = params.get('emailType', 'Professional')
    tone = params.get('tone', 'Professional')
    language = params.get('language', 'English')
    length = params.get('length', 'Medium')

    name = custom_recipient if custom_recipient else recipient

    # Multi-language handling
    if language == 'Hindi':
        subject = f"विषय: {topic[:35]} बाबत"
        salutation = f"आदरणीय {name} जी,"
        if length == 'Short':
            body = f"{salutation}\n\nसविनय निवेदन है कि {topic}। कृपया इस संबंध में सकारात्मक विचार करने की कृपा करें।\n\nसधन्यवाद,\n[आपका नाम]\n[संपर्क सूत्र]"
        else:
            body = f"{salutation}\n\nसविनय निवेदन है कि मैं आपके संज्ञान में यह विषय लाना चाहता हूँ कि {topic}।\n\nइस संबंध में मैंने आवश्यक तैयारियां कर ली हैं। आपसे विनम्र अनुरोध है कि उचित मार्गदर्शन एवं स्वीकृति प्रदान करें।\n\nआपके सहयोग हेतु अग्रिम धन्यवाद।\n\nभवदीय,\n[आपका पूरा नाम]\n[अनुक्रमांक / पद]\n[विभाग]"
        return {"subject": subject, "body": body, "source": "MailCraft Backend Engine (Hindi)"}

    if language == 'Hinglish':
        subject = f"Regarding: {topic[:35]}"
        salutation = f"Dear {name},"
        if length == 'Short':
            body = f"{salutation}\n\nHope aap ache honge. Main yeh email share kar raha tha regarding: {topic}.\n\nKindly isko consider karein and let me know. Thanks!\n\nBest regards,\n[Your Name]"
        else:
            body = f"{salutation}\n\nHope everything is going well. Main yeh email aapko directly update share karne ke liye likh raha hoon regarding {topic}.\n\nScenario yeh hai ki situation ke hisaab se prompt alignment required hai. Maine required preliminary work review kar liya hai aur main deliverable timeline par ensure karunga.\n\nPlease check kijiye aur let me know if any questions.\n\nWarm regards,\n[Your Full Name]\n[Contact Info]"
        return {"subject": subject, "body": body, "source": "MailCraft Backend Engine (Hinglish)"}

    # English Default
    prefix = ""
    if tone == 'Urgent':
        prefix = "[Action Required] "
    elif tone == 'Polite':
        prefix = "Request: "
    elif email_type == 'Job Application':
        prefix = "Application: "

    subject = f"{prefix}{email_type} regarding {topic[:35]}".strip()
    salutation = f"Respected {name}," if "prof" in recipient.lower() else f"Dear {name},"

    if length == 'Short':
        body = (
            f"{salutation}\n\n"
            f"I hope this email finds you well. I am writing to briefly communicate regarding: {topic}.\n\n"
            f"Could you please review this at your earliest convenience and let me know your thoughts?\n\n"
            f"Thank you for your time and consideration.\n\n"
            f"Sincerely,\n"
            f"[Your Full Name]\n"
            f"[Designation / Roll Number]\n"
            f"[Contact Details]"
        )
    elif length == 'Detailed':
        body = (
            f"{salutation}\n\n"
            f"I hope this email finds you well. I am reaching out to provide a comprehensive update and formally discuss the matter regarding {topic}.\n\n"
            f"To provide full clarity, here are the key background details and parameters:\n"
            f"• Core Objective: Timely coordination and mutual alignment on deliverables.\n"
            f"• Context & Circumstances: {topic}\n"
            f"• Proposed Timeline: Ready for immediate review and implementation upon your approval.\n"
            f"• Contact & Availability: I remain accessible via email or phone for any urgent follow-ups.\n\n"
            f"I would greatly appreciate your insight, guidance, and approval on the next steps.\n\n"
            f"Thank you very much for your time and continuous support.\n\n"
            f"Warm regards,\n"
            f"[Your Full Name]\n"
            f"[Department / Course / Roll No]\n"
            f"[Phone: +91 XXXXX XXXXX]"
        )
    else: # Medium
        body = (
            f"{salutation}\n\n"
            f"I hope this email finds you well. I am writing to bring an important update to your kind attention regarding {topic}.\n\n"
            f"I have taken care to prepare the necessary groundwork so that all related tasks proceed smoothly without interruption. Your review and confirmation would be greatly appreciated.\n\n"
            f"Please let me know if you require any additional information or documentation from my end.\n\n"
            f"Thank you for your time and consideration.\n\n"
            f"Best regards,\n"
            f"[Your Full Name]\n"
            f"[Designation / Roll No]\n"
            f"[Contact Information]"
        )

    return {"subject": subject, "body": body, "source": "MailCraft Backend Engine (v2.0)"}

# --------------------------------------------------------------------------
# External LLM Callers (Optional with .env Keys)
# --------------------------------------------------------------------------
def call_gemini_api(api_key, params):
    topic = params.get('topic', '')
    recipient = params.get('customRecipient') or params.get('recipient', 'Colleague')
    email_type = params.get('emailType', 'Professional')
    tone = params.get('tone', 'Professional')
    lang = params.get('language', 'English')
    length = params.get('length', 'Medium')

    prompt = (
        f"You are MailCraft AI, a professional email generator.\n"
        f"Topic: {topic}\nRecipient: {recipient}\nCategory: {email_type}\nTone: {tone}\n"
        f"Language: {lang}\nLength: {length}\n\n"
        f"Return ONLY a raw JSON object with keys 'subject' and 'body'. No markdown ticks."
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }).encode('utf-8')

    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode('utf-8'))
        raw_text = data['candidates'][0]['content']['parts'][0]['text']
        parsed = json.loads(raw_text.replace('```json', '').replace('```', '').strip())
        return {
            "subject": parsed.get('subject', 'Generated Email'),
            "body": parsed.get('body', ''),
            "source": "Google Gemini 1.5 Flash (Backend)"
        }

def call_openai_api(api_key, params):
    topic = params.get('topic', '')
    recipient = params.get('customRecipient') or params.get('recipient', 'Colleague')
    email_type = params.get('emailType', 'Professional')
    tone = params.get('tone', 'Professional')
    lang = params.get('language', 'English')
    length = params.get('length', 'Medium')

    sys_prompt = "You are MailCraft AI. Output JSON only: {\"subject\": \"...\", \"body\": \"...\"}"
    user_prompt = f"Topic: {topic}\nRecipient: {recipient}\nType: {email_type}\nTone: {tone}\nLanguage: {lang}\nLength: {length}"

    url = "https://api.openai.com/v1/chat/completions"
    payload = json.dumps({
        "model": "gpt-4o-mini",
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": user_prompt}
        ]
    }).encode('utf-8')

    req = urllib.request.Request(url, data=payload, headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    })
    with urllib.request.urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode('utf-8'))
        content = data['choices'][0]['message']['content']
        parsed = json.loads(content)
        return {
            "subject": parsed.get('subject', 'Generated Email'),
            "body": parsed.get('body', ''),
            "source": "OpenAI GPT-4o-mini (Backend)"
        }

# --------------------------------------------------------------------------
# HTTP Request Handler
# --------------------------------------------------------------------------
class MailCraftHandler(BaseHTTPRequestHandler):

    def send_json(self, status_code, data):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # REST API Routes
        if path == '/api/health':
            self.send_json(200, {
                "status": "healthy",
                "app": "MailCraft AI",
                "version": "2.0.0",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "backend_llm": "Gemini" if GEMINI_API_KEY else ("OpenAI" if OPENAI_API_KEY else "Local Dynamic Engine")
            })
            return

        if path == '/api/history':
            try:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute('SELECT id, subject, body, topic, recipient, custom_recipient, email_type, tone, language, length, is_favorite, created_at, updated_at, source FROM emails ORDER BY created_at DESC')
                rows = cursor.fetchall()
                conn.close()

                items = []
                for r in rows:
                    items.append({
                        "id": r[0],
                        "subject": r[1],
                        "body": r[2],
                        "topic": r[3],
                        "recipient": r[4],
                        "customRecipient": r[5],
                        "emailType": r[6],
                        "tone": r[7],
                        "language": r[8],
                        "length": r[9],
                        "isFavorite": bool(r[10]),
                        "createdAt": r[11],
                        "updatedAt": r[12],
                        "source": r[13]
                    })
                self.send_json(200, {"items": items, "count": len(items)})
            except Exception as e:
                self.send_json(500, {"error": str(e)})
            return

        # Static File Serving
        self.serve_static_file(path)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'

        try:
            body_json = json.loads(post_data)
        except json.JSONDecodeError:
            self.send_json(400, {"error": "Invalid JSON body"})
            return

        if path == '/api/generate':
            topic = body_json.get('topic', '').strip()
            if not topic:
                self.send_json(400, {"error": "Missing topic or purpose"})
                return

            try:
                if GEMINI_API_KEY:
                    result = call_gemini_api(GEMINI_API_KEY, body_json)
                elif OPENAI_API_KEY:
                    result = call_openai_api(OPENAI_API_KEY, body_json)
                else:
                    result = synthesize_server_email(body_json)
                self.send_json(200, result)
            except Exception as e:
                print(f"[Generate Error] {e}")
                # Fallback to local engine on any network or key failure
                result = synthesize_server_email(body_json)
                result['source'] += ' (Auto Fallback)'
                self.send_json(200, result)
            return

        if path == '/api/history':
            try:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR REPLACE INTO emails 
                    (id, subject, body, topic, recipient, custom_recipient, email_type, tone, language, length, is_favorite, created_at, updated_at, source)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    body_json.get('id', 'mc_' + str(int(datetime.utcnow().timestamp() * 1000))),
                    body_json.get('subject', 'Untitled'),
                    body_json.get('body', ''),
                    body_json.get('topic', ''),
                    body_json.get('recipient', 'General'),
                    body_json.get('customRecipient', ''),
                    body_json.get('emailType', 'Professional'),
                    body_json.get('tone', 'Professional'),
                    body_json.get('language', 'English'),
                    body_json.get('length', 'Medium'),
                    1 if body_json.get('isFavorite') else 0,
                    body_json.get('createdAt', datetime.utcnow().isoformat() + 'Z'),
                    datetime.utcnow().isoformat() + 'Z',
                    body_json.get('source', 'MailCraft AI')
                ))
                conn.commit()
                conn.close()
                self.send_json(200, {"status": "saved", "id": body_json.get('id')})
            except Exception as e:
                self.send_json(500, {"error": str(e)})
            return

        self.send_json(404, {"error": "Endpoint not found"})

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/history/'):
            item_id = path.split('/api/history/')[1]
            try:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute('DELETE FROM emails WHERE id = ?', (item_id,))
                conn.commit()
                conn.close()
                self.send_json(200, {"status": "deleted", "id": item_id})
            except Exception as e:
                self.send_json(500, {"error": str(e)})
            return

        if path == '/api/history':
            try:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute('DELETE FROM emails')
                conn.commit()
                conn.close()
                self.send_json(200, {"status": "cleared"})
            except Exception as e:
                self.send_json(500, {"error": str(e)})
            return

        self.send_json(404, {"error": "Endpoint not found"})

    def serve_static_file(self, req_path):
        if req_path in ('', '/'):
            req_path = '/index.html'

        # Prevent directory traversal
        clean_path = os.path.normpath(req_path).lstrip('/')
        full_path = os.path.join(BASE_DIR, clean_path)

        if not full_path.startswith(BASE_DIR) or not os.path.exists(full_path) or os.path.isdir(full_path):
            self.send_error(404, "File Not Found")
            return

        mime_type, _ = mimetypes.guess_type(full_path)
        if not mime_type:
            mime_type = 'application/octet-stream'

        try:
            with open(full_path, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', mime_type)
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Error reading file: {e}")

# --------------------------------------------------------------------------
# Server Startup
# --------------------------------------------------------------------------
def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, MailCraftHandler)
    print("=" * 65)
    print("🚀 MailCraft AI – Smart Email Generator (v2.0)")
    print("   B.Tech Computer Science & Engineering Capstone Project")
    print("=" * 65)
    print(f"👉 Local Web App : http://localhost:{PORT}")
    print(f"📡 API Health    : http://localhost:{PORT}/api/health")
    print(f"📁 Database      : SQLite ({DB_FILE})")
    if GEMINI_API_KEY:
        print("🤖 AI Provider   : Google Gemini API (Configured)")
    elif OPENAI_API_KEY:
        print("🤖 AI Provider   : OpenAI API (Configured)")
    else:
        print("🤖 AI Provider   : Dynamic Semantic NLP Engine (Local & Offline Ready)")
    print("=" * 65)
    print("Press Ctrl+C to stop the server.\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Shutting down MailCraft AI Server...]")
        httpd.server_close()
        sys.exit(0)

if __name__ == '__main__':
    run()
