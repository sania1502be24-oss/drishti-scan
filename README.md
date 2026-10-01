# Drishti Scan — See Threats. Secure What Matters.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org)
[![Python](https://img.shields.io/badge/Python-3.13+-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![Pytest](https://img.shields.io/badge/Pytest-13%20Passed-brightgreen.svg?logo=pytest&logoColor=white)](https://pytest.org)
[![Security](https://img.shields.io/badge/Security-SSRF%20Safe%20%7C%20IDOR%20Protected-blueviolet.svg)](#security-architecture)

> **Drishti Scan** is an explainable, full-stack cybersecurity assessment, awareness, and telemetry platform. It bridges technical threat detection with user education: users inspect suspicious URLs, understand structural threat indicators, practice defense against phishing scenarios, and measure their personal cyber readiness.

---

## 🌟 Key Modules & Engineering Features

### 🛡️ Module 1 — URL & Phishing Threat Scanner
- **SSRF-Safe Static Analysis:** Evaluates structural, lexical, and cryptographic characteristics without blindly fetching untrusted targets, eliminating Server-Side Request Forgery vulnerabilities.
- **Brand Subdomain Misdirection:** Unmasks deceptive domains (e.g. `paypal.com.verify-billing.xyz` where the root domain is `verify-billing.xyz`).
- **Typosquatting & Homoglyphs:** Uses Levenshtein distance against high-profile target brands (`paypal`, `apple`, `google`, `microsoft`, `chase`) and detects Punycode (`xn--`) IDN homographs.
- **Shannon Entropy Analysis:** Computes character randomness to detect Domain Generation Algorithms (DGA) used by malware command-and-control servers.
- **Calibrated Risk Score (0–100):** Transparent scoring with categorized evidence, clear severity labels, and actionable mitigations.

### 🔑 Module 2 — Password Security & Entropy Lab
- **100% Client-Side Privacy Guarantee:** Keystrokes and passwords are evaluated strictly in browser memory. Zero network transmission to backends or AI models.
- **Shannon Entropy Engine:** Computes $H = L \log_2(N)$ bits to reflect mathematical combinatorial difficulty.
- **Adversary Crack Time Simulation:** Compares online throttled attacks (100 attempts/min) against high-speed offline GPU arrays (Hashcat rig at 100 Billion hashes/sec).
- **Memorable Passphrase Generator:** Generates 4-word Diceware passphrases (~75+ bits of entropy) demonstrating why long memorable phrases surpass complex short passwords.

### 🎓 Module 3 — Cyber Awareness Academy
- **Interactive Phishing Simulations:** Realistic visual scenario mocks (spoofed email headers, suspicious URL inspect widgets).
- **Server-Side Grading & Anti-Tampering:** Answers are evaluated securely on the backend, preventing client-side inspection cheats.
- **Threat Vector Reviews:** Detailed explanations on why answers are correct or incorrect, covering MFA fatigue, homoglyphs, and urgent psychological pretexts.
- **Milestone Tracking:** Best score recording and progress tracking on personal dashboards.

### 📊 Module 4 — Personal Security Dashboard
- **Strict Row-Level Isolation:** Every scan record, PDF report, and quiz attempt belongs strictly to the authenticated user. Prevents Insecure Direct Object References (IDOR).
- **Telemetry Visualizations:** Risk distribution breakdowns, 7-day volume trends, and top triggered threat indicators.
- **Searchable Scan Archive:** Filter history by domain or severity tier.

### 📄 Module 5 — Executive PDF Reports & CSV Export
- **Dynamic PDF Generation:** Built with ReportLab, producing branded executive security assessment summaries with threat badges, evidence tables, and mitigation roadmaps.
- **CSV Data Export:** One-click download of user scan archives for compliance and security auditing.

### 🤖 Module 6 — Threat Intelligence & AI Advisory
- **Correlated Threat Feeds:** Integrated reputation checks displaying confidence scores, verdict statuses, and telemetry freshness.
- **Transparent AI Synthesis:** Grounded threat briefings highlighting attack vectors and immediate defensive checklists without hallucinations.
- **Optional Gemini API:** Drop-in support for `GEMINI_API_KEY` for generative threat advisory.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries / Roles |
|:---|:---|:---|
| **Frontend** | React 19, Vite | Lucide React, Custom Responsive Glassmorphic Design System |
| **Backend** | Python 3.13, FastAPI | Pydantic V2, SQLAlchemy, Uvicorn, Bcrypt, PyJWT |
| **PDF Engine** | ReportLab 5.0 | Dynamic flowable tables, threat gauge graphics, report generator |
| **Database** | SQLite / PostgreSQL | Zero-config local SQLite with drop-in PostgreSQL compatibility |
| **Testing** | Pytest, Httpx | 13 automated unit & API integration tests |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ and npm

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/drishti-scan.git
cd drishti-scan
```

### 2. Backend Setup
```bash
# Navigate to backend and create virtual environment
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The API documentation will be available at: **http://127.0.0.1:8000/docs**

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite React development server
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🧪 Running Automated Tests

Run the backend test suite:
```bash
# From the project root
set PYTHONPATH=backend
backend\venv\Scripts\pytest backend/tests -v
```

All **13 automated tests** cover:
- URL normalization & scheme validation
- SSRF prevention on private IP targets (`127.0.0.1`, `10.0.0.1`)
- Direct IP host detection & obfuscated hex hosts
- Brand-in-subdomain misdirection detection
- Levenshtein typosquatting detection
- Shannon entropy calculation for DGA detection
- Punycode IDN homoglyph detection
- Password hashing with Bcrypt & JWT verification
- PDF security report generation
- User registration, login, and strict row-level authorization isolation (User A cannot view User B's scans)
- Academy quiz grading & user progress persistence

---

## 🔒 Security & Defensive Engineering Highlights

1. **SSRF Defense:** The URL analysis engine operates purely offline on lexical, structural, and cryptographic features. It never executes arbitrary requests against user-submitted endpoints.
2. **Strict Row-Level Authorization:** All database queries for scans and reports filter strictly by `user_id == current_user.id`. Requests for other users' scan IDs return an HTTP `403 Forbidden` or `404 Not Found`.
3. **Zero-Knowledge Password Testing:** The password analyzer operates exclusively in browser client-side JavaScript. Passwords are never sent to any server.
4. **Transparent Risk Scoring:** Risk scores are bounded (0–100) and accompanied by clear indicator breakdowns, avoiding black-box assertions.

---

## 📁 Repository Structure

```
drishti-scan/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py              # Auth dependency injection & ownership
│   │   │   └── routes/
│   │   │       ├── auth.py          # Register, login, profile
│   │   │       ├── scans.py         # URL scanning, history, PDF reports
│   │   │       ├── dashboard.py     # User telemetry and analytics
│   │   │       └── academy.py       # Learning modules & quiz grading
│   │   ├── core/
│   │   │   ├── config.py            # Environment configuration
│   │   │   ├── database.py          # SQLAlchemy engine & session maker
│   │   │   └── security.py          # Bcrypt hashing & PyJWT token handling
│   │   ├── models/
│   │   │   └── models.py            # User, Scan, Finding, Quiz schemas
│   │   ├── schemas/
│   │   │   └── schemas.py           # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── url_scanner.py       # Heuristic detection & scoring engine
│   │   │   ├── report_generator.py  # ReportLab PDF generator
│   │   │   ├── ai_explainer.py      # AI & expert threat briefing service
│   │   │   └── academy_content.py   # Course modules & quiz seeder
│   │   └── main.py                  # FastAPI app entry point
│   ├── tests/
│   │   ├── test_drishti.py          # Unit tests (SSRF, heuristics, auth)
│   │   └── test_api_endpoints.py    # E2E API integration & isolation tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Responsive nav with mobile drawer
│   │   │   ├── Footer.jsx           # Architecture & defensive notice
│   │   │   └── RiskGauge.jsx        # SVG circular risk score gauge
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Hero scanner & platform pillars
│   │   │   ├── ScannerPage.jsx      # URL scanner workspace & report download
│   │   │   ├── PasswordLabPage.jsx  # Client-side entropy & crack lab
│   │   │   ├── AcademyPage.jsx      # Phishing scenario quizzes & lessons
│   │   │   ├── DashboardPage.jsx    # Metrics, charts, history & CSV export
│   │   │   ├── LoginPage.jsx        # Secure user sign in
│   │   │   └── RegisterPage.jsx     # New account registration
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # JWT auth state management
│   │   ├── services/
│   │   │   └── api.js               # API service layer
│   │   ├── utils/
│   │   │   └── passwordAnalyzer.js  # 100% client-side entropy utility
│   │   ├── App.jsx                  # Main router setup
│   │   └── index.css                # Dark cybersecurity design system
│   ├── package.json
│   └── vite.config.js
├── docs/
│   └── architecture.md              # Technical architecture & threat model
├── run_backend.bat                  # One-click Windows backend runner
├── run_frontend.bat                 # One-click Windows frontend runner
├── run_tests.bat                    # One-click test runner
├── .env.example
├── .gitignore
└── README.md
```

---

## 💼 Placement & Interview Talking Points

- **Full-Stack Engineering:** Clean separation of concerns between React 19 frontend and FastAPI backend. RESTful architecture with Pydantic V2 schema validation and SQLAlchemy ORM.
- **Cybersecurity Knowledge:** Clear understanding of SSRF attack surfaces, brand typosquatting, IDN homographs, and credential stuffing vectors.
- **Defensive Design:** Designed client-side password evaluation for genuine zero-knowledge privacy, avoiding unnecessary data collection.
- **Detection Engineering:** Transparent, explainable scoring algorithm with calibrated weights rather than ungrounded black-box models.
- **Code Quality:** 13 automated tests covering edge cases, authentication, and data isolation.

---

## 📄 License
This project is licensed under the MIT License — feel free to use and extend it for your portfolio and research!
