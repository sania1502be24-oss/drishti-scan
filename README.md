# Drishti Scan — See Threats. Secure What Matters.

**Drishti Scan** is a full-stack cybersecurity assessment and awareness platform designed to help users assess suspicious URLs, understand potential online threats, explore security awareness lessons, and review scan results through a centralized dashboard.

🌐 **Live Demo:** [Open Drishti Scan](https://drishti-scan-mrti-c0vqrc5fv-sanias-projects-9d90689c.vercel.app/)
⚙️ **Backend API:** [Drishti Scan API](https://drishti-scan-api.onrender.com/)
🩺 **API Health:** [Check API Health](https://drishti-scan-api.onrender.com/api/health)
💻 **GitHub Repository:** [sania1502be24-oss/drishti-scan](https://github.com/sania1502be24-oss/drishti-scan)

---

## 📌 Project Overview

Online threats such as phishing and malicious links can expose users to fraud, credential theft, and other cybersecurity risks. Drishti Scan combines URL assessment tools with educational resources to encourage safer digital habits.

The platform brings together security assessment, authentication, scan history, reporting, and cybersecurity awareness in one responsive web application.

## ✨ Key Features

### 🔎 URL Security Assessment

* Submit URLs for security assessment.
* View scan results and associated risk indicators.
* Review previous scans and individual scan details.
* Explore potential warning signs associated with suspicious URLs.

### 🔐 User Authentication

* User registration and login.
* Token-based authentication.
* Authenticated access to user-specific application features.

### 📊 Security Dashboard

* Centralized dashboard for scan activity and security statistics.
* Scan history and detailed results.
* Search and severity-based filtering, where supported by the application.

### 📄 Security Reports

* Export scan reports in PDF format.
* Export scan data in CSV format.
* Keep assessment results available for review.

### 🎓 Cybersecurity Awareness Academy

* Educational cybersecurity modules.
* Learning content covering online safety and threat awareness.
* Interactive quizzes and learning activities.

### 🔑 Password Security Learning

* Password entropy assessment and educational guidance to help users understand password strength.

### 🤖 Threat Intelligence and AI — Extensible Capabilities

* Designed to support future integrations with external threat intelligence and AI-assisted analysis.
* Optional integrations depend on configuration and valid API credentials.

> **Important:** Drishti Scan is an educational and assessment tool. Its results should not be treated as a guarantee that a URL is safe or malicious.

## 🛠️ Technology Stack

| Component           | Technologies                                               |
| ------------------- | ---------------------------------------------------------- |
| Frontend            | React, Vite, JavaScript, CSS                               |
| Backend             | Python, FastAPI                                            |
| API                 | REST API                                                   |
| Authentication      | JWT-based authentication                                   |
| Database            | SQLAlchemy with SQLite or a configured compatible database |
| Reporting           | PDF and CSV exports                                        |
| Testing             | Pytest                                                     |
| Frontend deployment | Vercel                                                     |
| Backend deployment  | Render                                                     |
| Version control     | Git and GitHub                                             |

## 🏗️ Architecture

The application follows a frontend–backend architecture.

1. **Frontend:** Provides the user interface for registration, authentication, scans, dashboard activity, reports, and learning modules.
2. **Backend:** Handles API requests, authentication, scan processing, and application logic.
3. **Database:** Stores application data through SQLAlchemy.
4. **Reporting:** Provides downloadable PDF and CSV outputs.
5. **Deployment:** The frontend and backend are hosted separately.

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
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── .gitignore
└── README.md
```

*This is a high-level structure; folders and files may vary slightly with the current repository.*

## 🚀 Run Locally

### Prerequisites

* Python 3.13 or a compatible Python version
* Node.js and npm
* Git

### 1. Clone the repository

```bash
git clone https://github.com/sania1502be24-oss/drishti-scan.git
cd drishti-scan
```

### 2. Set up the backend

Open a terminal in the project root:

```powershell
python -m venv backend/venv
.\backend\venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

Configure the required environment variables using the project's `.env.example` as a reference. Keep your actual `.env` file private and never commit credentials.

Start the backend:

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

Backend development address: `http://127.0.0.1:8000`

Interactive API documentation: `http://127.0.0.1:8000/docs`

### 3. Set up the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local development address printed by Vite in the terminal.

**Note:** Local frontend-to-backend routing must match the project's Vite proxy or API configuration. Configure the required local proxy if needed.

### 4. Build the frontend

```powershell
cd frontend
npm run build
```

## 🧪 Testing

Backend tests can be run from the project root:

```powershell
python -m pytest backend/tests -v
```

Run the frontend checks using the scripts defined in `frontend/package.json`:

```powershell
cd frontend
npm run
```

Then execute the available lint and build scripts.

## 🔒 Security Considerations

* Store production secrets in the hosting provider's environment settings.
* Use a strong, randomly generated production `SECRET_KEY`.
* Never commit `.env` files, passwords, API keys, or database credentials.
* Configure CORS to allow only the intended frontend origins.
* Protect authenticated endpoints and verify authorization for user-specific data.
* Use HTTPS for deployed application traffic.
* Verify database persistence and backups before relying on production data.
* Treat automated URL assessments as indicators, not definitive security verdicts.

## 🎯 Learning Outcomes

This project provides practical experience with:

* Full-stack application development.
* REST API development using FastAPI.
* Frontend and backend integration.
* Authentication and access control concepts.
* SQLAlchemy and database integration.
* Cybersecurity awareness and URL assessment.
* Automated testing and deployment workflows.
* PDF/CSV reporting and Git-based collaboration.

## 🔮 Future Enhancements

* Persistent production database and backup strategy.
* Expanded threat intelligence integrations.
* More detailed URL and domain analysis.
* Improved scan explanations and risk indicators.
* Additional cybersecurity learning modules.
* Enhanced monitoring, logging, and automated security tests.

## 👩‍💻 Author

**Sania Mittal**
Computer Science Engineering Student | Cybersecurity | Full-Stack Development | AI

* GitHub: [sania1502be24-oss](https://github.com/sania1502be24-oss)

## 📄 License

This project is distributed under the MIT License if the repository's existing license file specifies MIT. Refer to the repository's license file for the applicable terms.
