# 🔍 Drishti Scan

### See Threats. Secure What Matters.

**Drishti Scan** is a full-stack cybersecurity assessment and awareness platform designed to help users assess suspicious URLs, understand potential online threats, and improve their cybersecurity awareness through interactive learning.

<p align="center">
  <a href="https://drishti-scan-mrti-c0vqrc5fv-sanias-projects-9d90689c.vercel.app/">
    <strong>🌐 Live Demo</strong>
  </a>
  &nbsp; • &nbsp;
  <a href="https://drishti-scan-api.onrender.com/docs">
    <strong>⚡ API Documentation</strong>
  </a>
  &nbsp; • &nbsp;
  <a href="https://github.com/sania1502be24-oss/drishti-scan">
    <strong>💻 Source Code</strong>
  </a>
</p>

---

## 📌 About the Project

As online threats continue to evolve, users need accessible tools that help them recognize suspicious links and understand common cybersecurity risks.

**Drishti Scan** brings URL assessment, user authentication, scan history, security reporting, and cybersecurity education together in one web platform.

The project combines full-stack development with practical cybersecurity concepts, providing a foundation for exploring threat assessment, secure application design, and security awareness.

## ✨ Features

### 🔎 URL Security Assessment

* Submit URLs for security assessment.
* Review scan results and risk indicators.
* Examine scan details and previously recorded scans.
* Learn about potential warning signs associated with suspicious URLs.

### 🔐 User Authentication

* User registration and login.
* Token-based authentication.
* Authenticated access to protected application features.

### 📊 Security Dashboard

* Centralized view of scan activity and security statistics.
* Access scan history and individual scan details.
* Review assessment results in one place.

### 📄 Report Generation

* Download security reports in PDF format.
* Export scan records in CSV format.
* Keep results available for further review.

### 🎓 Cybersecurity Academy

* Educational modules covering cybersecurity concepts.
* Interactive quizzes and learning activities.
* Resources to encourage safer online practices.

### 🛡️ Security-Focused Design

* Backend API built with FastAPI.
* Database access managed through SQLAlchemy.
* Configuration-based secret management.
* CORS controls and authentication mechanisms.

> **Note:** Automated URL assessments have limitations. A low-risk result does not guarantee that a website is safe.

## 🖥️ Technology Stack

| Layer            | Technologies                                                               |
| ---------------- | -------------------------------------------------------------------------- |
| Frontend         | React, Vite, JavaScript, CSS                                               |
| Backend          | Python, FastAPI                                                            |
| API              | REST                                                                       |
| Authentication   | JWT                                                                        |
| Database layer   | SQLAlchemy                                                                 |
| Database         | SQLite by default; production database depends on deployment configuration |
| Reporting        | PDF and CSV                                                                |
| Testing          | Pytest                                                                     |
| Frontend hosting | Vercel                                                                     |
| Backend hosting  | Render                                                                     |
| Version control  | Git and GitHub                                                             |

## 🏗️ How It Works

```text
           ┌──────────────────────┐
           │      User / Browser  │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │   React Frontend     │
           │  UI and Dashboard    │
           └──────────┬───────────┘
                      │ REST API
                      ▼
           ┌──────────────────────┐
           │    FastAPI Backend   │
           │ Auth, Scans, Academy │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │ SQLAlchemy / Database│
           └──────────────────────┘
```

The frontend communicates with the backend through API requests. The backend handles application logic, authentication, scan operations, and database interactions. Reporting features make assessment results available for download.

## 📂 Project Structure

```text
drishti-scan/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── auth.py
│   │   │       ├── scans.py
│   │   │       ├── dashboard.py
│   │   │       └── academy.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── services/
│   │   └── main.py
│   ├── requirements.txt
│   └── tests/
├── frontend/
│   ├── src/
│   │   └── services/
│   │       └── api.js
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── .env.example
├── .gitignore
└── README.md
```

*This is a representative project structure. Check the repository for the exact current file layout.*

## ⚙️ Getting Started

### Prerequisites

Install the following:

* Python 3.13 or a compatible version
* Node.js and npm
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/sania1502be24-oss/drishti-scan.git
cd drishti-scan
```

### 2. Configure the Backend

Create and activate a virtual environment:

```powershell
python -m venv backend/venv
.\backend\venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install -r backend/requirements.txt
```

Configure the environment variables required by the project. Use `.env.example` as a reference and keep your real credentials private.

### 3. Start the Backend

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

The backend should be available at:

* API: `http://127.0.0.1:8000`
* Interactive documentation: `http://127.0.0.1:8000/docs`
* Health check: `http://127.0.0.1:8000/api/health`

### 4. Start the Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the development URL printed by Vite.

Ensure the frontend API configuration or Vite proxy points to the local backend when running locally.

### 5. Build the Frontend

```powershell
cd frontend
npm run build
```

## 🧪 Testing

Run backend tests from the repository root:

```powershell
python -m pytest backend/tests -v
```

To view the frontend scripts available in the project:

```powershell
cd frontend
npm run
```

Use the configured lint and build scripts to check the frontend.

## 🔒 Security Considerations

* Keep secret keys, database credentials, and API keys out of version control.
* Use a strong, randomly generated secret key in production.
* Configure CORS to allow only trusted frontend origins.
* Enforce authentication and authorization on protected endpoints.
* Use HTTPS for deployed traffic.
* Verify database persistence and backups for production deployments.
* Treat scan results as assessment indicators rather than definitive security guarantees.

## 🚀 Deployment

Drishti Scan uses separate hosting for its frontend and backend.

| Component         | Platform | Link                                                                                     |
| ----------------- | -------- | ---------------------------------------------------------------------------------------- |
| Frontend          | Vercel   | [Open Website](https://drishti-scan-mrti-c0vqrc5fv-sanias-projects-9d90689c.vercel.app/) |
| Backend           | Render   | [Open API](https://drishti-scan-api.onrender.com/)                                       |
| API Documentation | FastAPI  | [View Docs](https://drishti-scan-api.onrender.com/docs)                                  |
| Health Check      | FastAPI  | [Check Status](https://drishti-scan-api.onrender.com/api/health)                         |

## 🗺️ Future Improvements

* Expanded threat intelligence integrations.
* More detailed URL and domain analysis.
* Improved scan explanations and risk indicators.
* Stronger production database and backup strategy.
* Expanded cybersecurity learning resources.
* Additional automated tests and security monitoring.

## 🎯 What I Learned

Working on Drishti Scan provides hands-on experience with:

* Building a full-stack application.
* Developing REST APIs with FastAPI.
* Connecting a React frontend to a Python backend.
* Implementing authentication and database access.
* Generating downloadable security reports.
* Applying cybersecurity concepts in a practical project.
* Testing and deploying a web application.

## 👩‍💻 Author

**Sania Mittal**
Computer Science Engineering Student

**Areas of Interest:** Cybersecurity · Full-Stack Development · AI

* GitHub: [@sania1502be24-oss](https://github.com/sania1502be24-oss)

---

### 💡 Project Philosophy

*See threats. Understand risks. Build safer digital habits.*

Drishti Scan aims to make cybersecurity assessment and awareness more accessible through practical tools and learning resources.
