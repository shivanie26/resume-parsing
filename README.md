# Smart Resume Parsing and Competency Assessment Platform with Bias-Aware Recruitment

> **Academic Final-Year Project** | Full-Stack Web Application with Explainable AI (XAI) & Bias Mitigation Layer

---

## 📌 Problem Statement

Traditional resume screening relies on manual inspection or naive keyword match engines that are prone to human bias, subjective scoring, and inaccurate skill evaluation. Unconscious bias regarding gender, age, religion, caste, race, or photos often distorts hiring decisions.

This platform automates resume processing, extracts structured candidate data, evaluates competencies semantically against custom job requirements, provides transparent explainable candidate scores, and enforces a **Bias-Aware Evaluation Layer** that redacts non-job-relevant personal attributes.

---

## 🌟 Core Features

### 1. Dual User Portals
- **Recruiter Portal**: Post job descriptions, configure custom category weights, upload batch resumes, view candidate rankings, compare applicants side-by-side, and export CSV reports.
- **Candidate Portal**: Upload resumes, view extracted skills, track recruiter assessments, and get missing skill recommendations for career growth.

### 2. Resume Parsing & Information Extraction (Module 3)
- Supports **PDF** & **DOCX** documents via `pdf-parse` and `mammoth`.
- Converts unstructured resume text into structured JSON containing candidate name, contact, education degrees, technical skills, programming languages, tools, work history, projects, certifications, and calculated total experience.

### 3. Job Description Analysis & Custom Weighting (Module 4)
- Allows recruiters to set required vs. preferred skills, minimum experience years, and education requirements.
- Features **Interactive Competency Weighting Sliders** (default: Technical 40%, Experience 25%, Projects 15%, Education 10%, Certifications 10%).

### 4. Semantic Skill Matching & Taxonomy Engine (Module 5)
- Recognizes technical synonyms (e.g. `JS` ↔ `JavaScript`, `ML` ↔ `Machine Learning`, `React.js` ↔ `React`, `PyTorch` ↔ `Deep Learning`, `K8s` ↔ `Kubernetes`, `AWS` ↔ `Amazon Web Services`).

### 5. Bias-Aware Mitigation Layer (Module 7)
- Scrubs sensitive PII traits (Gender, Religion, Caste, Race/Ethnicity, Marital Status, Photo, Age) before candidate scoring.
- Displays an **Audit Transparency Card** detailing explicitly evaluated factors vs. excluded attributes.

### 6. Explainable AI (XAI) & Candidate Ranking (Modules 8 & 9)
- Rationale breakdown per category with verbatim resume evidence quotes.
- Automated leaderboard ranking with mandatory **Human Oversight Notice**: *"AI-assisted assessment — final recruitment decision must be made by a human recruiter."*

### 7. Side-by-Side Candidate Comparison Matrix (Module 12)
- Compare 2 to 4 candidates side-by-side with comparative Recharts bar visualizations and strength matrix.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), React Router DOM, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti, Axios |
| **Backend API** | Node.js, Express.js, JWT Auth, Bcrypt.js, Multer, Mongoose |
| **Database** | MongoDB (with High-Performance Embedded Datastore fallback) |
| **AI / NLP Microservice** | Python Flask, Regex & Semantic Taxonomy Parser |

---

## 📁 Folder Structure

```
smart-resume-platform/
├── backend/
│   ├── config/
│   │   └── dbStorage.js         # Hybrid MongoDB + Embedded JSON store
│   ├── middleware/
│   │   └── auth.js              # JWT & Role-Based Access Control (RBAC)
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Job.js               # Job schema & category weights
│   │   ├── Resume.js            # Resume metadata & parsed JSON
│   │   └── Assessment.js        # Competency evaluation & XAI rationale
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication endpoints
│   │   ├── jobRoutes.js         # Job CRUD & weight updates
│   │   ├── resumeRoutes.js      # File uploads & candidate directory
│   │   ├── assessmentRoutes.js  # Scoring, rankings & comparison matrix
│   │   └── dashboardRoutes.js   # Analytics & stats
│   ├── services/
│   │   ├── parserService.js     # Text extraction & PII scrubber
│   │   └── scoringEngine.js     # 5-Dimensional scoring algorithm
│   ├── uploads/                 # Uploaded PDF & DOCX storage
│   ├── .env                     # Environment variables
│   ├── .env.example             # Template environment variables
│   ├── package.json
│   ├── seed.js                  # Database seeder script
│   └── server.js                # Express REST API entry point
├── ai-service/
│   ├── main.py                  # Python Flask NLP microservice
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Header & quick demo role switcher
│   │   │   └── Footer.jsx       # Compliance banner & disclaimers
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global state & JWT token store
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx             # Hero section & features
│   │   │   ├── LoginPage.jsx               # Quick demo logins
│   │   │   ├── RegisterPage.jsx            # User registration
│   │   │   ├── RecruiterDashboard.jsx      # Analytics & Recharts
│   │   │   ├── CandidateDashboard.jsx      # Candidate profile & skills
│   │   │   ├── CreateJobPage.jsx           # Weight sliders & job post
│   │   │   ├── ResumeUploadPage.jsx        # Drag & drop file upload
│   │   │   ├── ResumeParsingResultPage.jsx # Parsed JSON inspector
│   │   │   ├── CandidateListPage.jsx       # Filterable directory
│   │   │   ├── CandidateProfilePage.jsx    # Profile view
│   │   │   ├── CompetencyAssessmentPage.jsx# XAI breakdown & evidence
│   │   │   ├── RankingDashboardPage.jsx    # Ranked leaderboard & CSV export
│   │   │   └── CandidateComparisonPage.jsx # Side-by-side comparison
│   │   ├── services/
│   │   │   └── api.js                  # Axios REST client
│   │   ├── App.jsx                     # Router
│   │   ├── index.css                   # Tailwind & glassmorphism CSS
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## ⚡ Installation & Launch Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- npm

### 1. Install Backend Dependencies & Seed Data
```bash
cd backend
npm install
node seed.js
```

### 2. Start Backend REST API Server
```bash
npm start
```
> Server runs on `http://localhost:5000`

### 3. Start Python AI Microservice (Optional / Dual Engine)
```bash
cd ../ai-service
pip install -r requirements.txt
python main.py
```
> Microservice runs on `http://localhost:5001`

### 4. Start React Frontend
```bash
cd ../frontend
npm install
npm run dev
```
> Web application opens at `http://localhost:3000`

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **Recruiter** | `recruiter@platform.com` | `password123` |
| **Candidate 1** | `alex.rivera@email.com` | `password123` |
| **Candidate 2** | `priya.sharma@email.com` | `password123` |

---

## 🛡️ Academic Compliance Notice

This project implements AI decision-support algorithms for final-year demonstration purposes. Automated match percentages serve as guidance metrics. Final hiring decisions must always be made by a human recruiter.
