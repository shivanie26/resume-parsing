# Smart Resume Parsing and Competency Assessment Platform with Bias-Aware Recruitment

An enterprise-ready, explainable full-stack recruitment platform designed to eliminate keyword guesswork, validate candidate technical skills through role-specific MCQ assessments, and provide anonymous initial screening to minimize unconscious hiring bias.

---

## 1. Project Overview & Problem Statement

Traditional Applicant Tracking Systems (ATS) and conventional recruitment pipelines suffer from critical flaws:
- **Keyword Stuffing over True Competence:** Unverified resumes with buzzwords often rank higher than authentic technical capability.
- **Unconscious Demographic Bias:** Recruiters reviewing applications early in the pipeline are unintentionally influenced by names, gender, age, photographs, locations, and educational institutions.
- **Black-Box Scoring:** AI systems produce opaque match percentages without clear reasons for rejection or shortlisting.
- **Lack of Candidate Feedback:** Candidates receive automated rejections without actionable skill-gap insights or guidance to improve.

**SmartResume** solves these limitations by combining:
1. **Rule-Based & NLP Resume Parsing** with normalized skill dictionaries.
2. **Server-Evaluated Role-Specific Competency Assessments** to verify practical knowledge.
3. **Anonymous Initial Screening** using unique Candidate IDs (`CAND-XXXX`) while masking protected demographic attributes.
4. **Deterministic & Explainable Candidate Scoring** (`40% Skills + 40% Assessment + 20% Experience`).
5. **Real-Time Recruiter Telemetry & CSV Audit Reports**.

---

## 2. Key Features & Innovations

### A. Explainable Candidate Scoring
Candidate rankings are 100% deterministic, audit-ready, and explainable:
$$\text{Final Score} = (\text{Skill Match} \times 0.40) + (\text{Competency Assessment} \times 0.40) + (\text{Experience/Projects} \times 0.20)$$
- **Skill Match (40%):** $(\text{Matched Required Skills} / \text{Total Required Skills}) \times 100$.
- **Competency Assessment (40%):** $(\text{Correct Answers} / \text{Total Questions}) \times 100$.
- **Experience & Projects (20%):** Rule-based points evaluated from documented roles, practical projects, and technology evidence.
- **Honest Pending Status:** Incomplete evaluations are explicitly tagged as **Assessment Pending** with provisional scores, preventing unfair comparison with fully evaluated candidates.

### B. Anonymous Initial Screening
- Candidates receive a unique Candidate ID (e.g. `CAND-8192`).
- Names, emails, and demographic attributes are masked in recruiter ranking and comparison views during initial screening.
- Recruiters evaluate qualifications, practical project evidence, and competency results first. Contact details can be unmasked when moving candidates to interview or selection stages.

### C. Candidate Skill-Gap Analysis & Prioritized Learning Path
- Compares extracted candidate skills against mandatory and preferred job requirements.
- Distinguishes high-priority mandatory missing skills from optional preferred skills.
- Generates a prioritized learning roadmap for candidate career development.

### D. Resume Improvement Assistant
- Recommends job-specific keywords to emphasize without fabricating experience.
- Prompts candidates with STAR/XYZ methodology tips for quantifying project descriptions.
- Provides a resume completeness checklist and recommended industry certifications.
- Includes mandatory candidate confirmation disclaimers to uphold verifiability.

### E. Competency Validation System
- Role-specific question banks (Full Stack Developer, Java & Spring Boot, AI/ML & NLP).
- Anti-leakage architecture: Correct answers (`correctOptionIndex`) are stored securely with `select: false` on the server and are never sent to the client during assessment taking.
- Server-side grading prevents manipulated submissions or client tampering.

### F. Recruiter Telemetry & Audit Reports
- Real-time analytics dashboard powered directly by MongoDB queries (Score Distribution, Job-wise Applicants, Assessment Completion ratios).
- Side-by-side comparison matrix for 2–4 candidates.
- 1-click CSV Report Export with complete candidate audit metrics.

---

## 3. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts (analytics visualizations), Lucide React (icons).
- **Backend:** Node.js, Express.js, RESTful API architecture.
- **Database:** MongoDB Atlas & Mongoose ODM.
- **Security & Authentication:** JWT (JSON Web Tokens), bcryptjs password hashing, role-based authorization middleware.
- **Resume Processing:** `pdf-parse` (PDF extraction), `mammoth` (DOCX extraction), custom NLP & regex boundary normalization.
- **File Uploads:** Multer with crypto random naming, MIME validation, and size constraints.
- **Testing:** Node.js native test runner and Supertest for integration and unit testing.

---

## 4. Project Structure

```
smart-resume/
├── client/                     # Frontend React (Vite) application
│   ├── src/
│   │   ├── api/                # Axios client with JWT interceptors
│   │   ├── context/            # AuthContext (JWT session state)
│   │   ├── components/         # Navbar, Footer, ProtectedRoute, ScoreBadge, LoadingSpinner
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── candidate/      # Dashboard, Upload, Review, SkillMatch, Assessment, Improvement
│   │   │   ├── recruiter/      # Dashboard, Job Management, Job Form, JD Analyzer, Rankings, Compare, Report
│   │   │   └── shared/         # JobList, JobDetails, ApplicationDetails
│   │   ├── App.jsx             # React Router routing configuration
│   │   ├── main.jsx
│   │   └── index.css           # Tailwind CSS directives
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── package.json
│
├── server/                     # Backend Express & Mongoose API
│   ├── src/
│   │   ├── config/             # MongoDB connection (db.js)
│   │   ├── models/             # User, CandidateProfile, Resume, Job, Application, Assessment, etc.
│   │   ├── controllers/        # auth, candidate, resume, job, assessment, application, recruiter
│   │   ├── routes/             # REST route endpoints
│   │   ├── services/           # resumeParserService, skillMatchingService, scoringService
│   │   ├── middleware/         # auth (JWT & roles), upload (Multer), errorHandler
│   │   ├── utils/              # skillDictionary, defaultAssessments, resumeImprovementRules, seedData
│   │   ├── app.js              # Express app setup and middleware
│   │   └── server.js           # Environment validation & DB connection initialization
│   ├── uploads/                # Secure private resume document storage
│   ├── tests/                  # Automated unit and API integration tests
│   ├── .env.example
│   └── package.json
│
├── sample_resumes/             # Sample candidate resume text for demonstration testing
├── package.json                # Root package.json with unified runner scripts
├── .gitignore
└── README.md
```

---

## 5. MongoDB Atlas Connection Setup

The application connects to MongoDB using Mongoose. To connect to your own **MongoDB Atlas** cluster:

### Step 1: Create a MongoDB Atlas Cluster
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (M0 sandbox).

### Step 2: Configure Network Access & IP Whitelist
1. In the MongoDB Atlas dashboard, navigate to **Security** → **Network Access**.
2. Click **Add IP Address**.
3. Choose **Allow Access from Anywhere** (`0.0.0.0/0`) for local development or enter your current IP address.

### Step 3: Create a Database User
1. Navigate to **Security** → **Database Access**.
2. Click **Add New Database User**.
3. Set authentication method to **Password**. Choose a username and password (e.g. `smart_admin` / `SecurePassword123`).
4. Assign user privileges: **Read and write to any database**.

### Step 4: Obtain Connection String & URL-Encoding
1. Navigate to **Database Deployments** → Click **Connect**.
2. Select **Drivers** (Node.js).
3. Copy the connection string format:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/smart_resume_db?retryWrites=true&w=majority
   ```
4. **Important:** If your password contains special characters (such as `@`, `#`, `%`, or `/`), you must URL-encode them (e.g. replace `@` with `%40`).

### Step 5: Configure `server/.env`
Open `server/.env` (or copy from `server/.env.example`) and insert your connection URL:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@your-cluster.mongodb.net/smart_resume_db?retryWrites=true&w=majority
JWT_SECRET=super_secure_random_jwt_secret_token_replace_in_production
NODE_ENV=development
```

*(Note: The server will validate that `MONGODB_URI` and `JWT_SECRET` are set upon startup and will display a diagnostic error if the database cannot be reached.)*

---

## 6. Installation & Startup Instructions

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)
- MongoDB instance (MongoDB Atlas connection string or local MongoDB service)

### Step 1: Install Dependencies
Run the following from the root directory:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Seed Demonstration Data (Optional but Recommended)
To populate the database with demonstration recruiters, candidates, jobs, questions, and applications:

```bash
cd server
npm run seed
```

### Step 3: Start the Backend Server
From the `server` directory:
```bash
npm run dev
```
The backend will connect to MongoDB and start on **http://localhost:5000**.

### Step 4: Start the Frontend Client
In a separate terminal window, from the `client` directory:
```bash
npm run dev
```
The client interface will launch on **http://localhost:5173**.

---

## 7. Demonstration Accounts

You can log in immediately using the provided 1-click login buttons on the `/login` page or with the following credentials:

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Recruiter** | Sarah Jenkins | `recruiter@demo.com` | `password123` | TechWave Solutions Inc. Full pipeline access |
| **Candidate** | Alex Rivera | `alex@demo.com` | `password123` | Full Stack Engineer (`CAND-8192`), Assessment Completed (80%) |
| **Candidate** | Jordan Chen | `jordan@demo.com` | `password123` | AI/ML Specialist (`CAND-4028`), Assessment Completed (100%) |
| **Candidate** | Taylor Smith | `taylor@demo.com` | `password123` | Junior UI Developer (`CAND-9341`), Assessment Pending |

---

## 8. Complete Candidate & Recruiter Workflows

### Candidate Journey:
1. **Register / Login:** Register as a candidate and receive a unique, anonymous Candidate ID.
2. **Upload Resume:** Upload a PDF or DOCX file. The parser extracts contact details, skills, education, projects, and work history.
3. **Review & Correct Extracted Details:** Candidates verify extracted skills and projects, correcting any parsing discrepancies before applying.
4. **Browse Jobs & Match:** View active job postings and click **Check Skill Match** to inspect matched vs missing mandatory skills.
5. **Apply:** Submit application with one click. An initial provisional score is calculated.
6. **Take Competency Assessment:** Complete the role-specific MCQ assessment. Questions are server-evaluated to prevent answer tampering.
7. **Review Assessment & Improvement Tips:** View question explanations and examine tailored STAR-method recommendations.
8. **Track Status:** Monitor your application progress (`Applied` → `Under Review` → `Shortlisted` → `Interview`).

### Recruiter Journey:
1. **Login:** Log in with recruiter credentials to access the Recruitment Analytics Suite.
2. **Post or Parse Jobs:** Post a job manually or paste raw job descriptions into the **JD Parser** to auto-extract technical requirements.
3. **Inspect Applications with Anonymous Screening:** Review applicants with masked demographic identifiers.
4. **Deterministic Rankings:** View candidate rankings sorted deterministically with explainable score contribution breakdowns.
5. **Side-by-Side Comparison:** Select 2–4 candidates to compare skill coverage, exam results, and project evidence side by side.
6. **Status Transitions & Audit History:** Advance qualified candidates to `Shortlisted` or `Interview` with audit comments.
7. **CSV Export:** Download full recruitment evaluation reports for compliance and offline analysis.

---

## 9. Running Automated Tests

Run the backend unit and integration test suite:

```bash
cd server
npm test
```

### Verified Test Suites:
- **Skill Dictionary & Normalization:** Validates alias normalization (e.g. JS → JavaScript) and word boundaries protecting against false positives (e.g. Java inside JavaScript, C inside CSS).
- **Skill Matching Formula:** Verifies $(\text{Matched} / \text{Total Required}) \times 100$ and safe zero-division handling.
- **Experience & Final Scoring:** Validates $0.40 \times \text{Skill} + 0.40 \times \text{Exam} + 0.20 \times \text{Exp}$ and pending assessment provisional scoring.
- **NLP Resume Parser:** Validates text extraction, section splitting, and project identification.
- **Resume Improvement Rules:** Verifies ethical recommendations without experience invention.
- **API Health & Routing:** Tests API health status and 404 responses via Supertest.

---

## 10. API Route Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new candidate or recruiter |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user session |
| `GET` | `/api/candidates/me` | Candidate | Retrieve candidate profile & parsed resume |
| `PUT` | `/api/candidates/me` | Candidate | Update candidate profile & skills |
| `GET` | `/api/candidates/applications` | Candidate | Retrieve candidate's active job applications |
| `GET` | `/api/candidates/resume-suggestions/:jobId` | Candidate | Retrieve job-specific resume improvement tips |
| `POST` | `/api/resumes/upload` | Candidate | Upload PDF/DOCX file and trigger parser |
| `GET` | `/api/resumes/:id` | Private | Retrieve resume details |
| `PUT` | `/api/resumes/:id/parsed-data` | Candidate | Correct and save extracted resume details |
| `GET` | `/api/jobs` | Public | List and search active job postings |
| `GET` | `/api/jobs/:id` | Public | Retrieve single job details |
| `POST` | `/api/jobs` | Recruiter | Create new job posting |
| `PUT` | `/api/jobs/:id` | Recruiter | Update existing job posting |
| `DELETE` | `/api/jobs/:id` | Recruiter | Delete job posting |
| `POST` | `/api/jobs/parse-jd` | Recruiter | Auto-extract requirements from job description text |
| `POST` | `/api/jobs/:id/match` | Candidate | Calculate skill match and gap analysis |
| `POST` | `/api/jobs/:id/apply` | Candidate | Submit job application and compute initial score |
| `GET` | `/api/jobs/:id/applications` | Recruiter | List applicants for job with anonymous screening |
| `GET` | `/api/applications/:id` | Private | Retrieve application dossier and status audit timeline |
| `PATCH` | `/api/applications/:id/status` | Recruiter | Update applicant status with audit note |
| `GET` | `/api/assessments/job/:jobId` | Candidate | Retrieve MCQ questions (correct answers omitted) |
| `POST` | `/api/assessments/job/:jobId/submit` | Candidate | Submit answers for server-side grading and scoring |
| `GET` | `/api/assessments/results/:id` | Private | View assessment score breakdown and explanations |
| `GET` | `/api/recruiter/analytics` | Recruiter | Real-time recruitment analytics from MongoDB |
| `GET` | `/api/recruiter/jobs/:jobId/rankings` | Recruiter | Deterministic candidate ranking with score contributions |
| `GET` | `/api/recruiter/jobs/:jobId/compare` | Recruiter | Side-by-side comparison for selected candidates |
| `GET` | `/api/recruiter/reports/:jobId` | Recruiter | Job evaluation audit report |
| `GET` | `/api/recruiter/reports/:jobId/export` | Recruiter | Export job evaluation report as CSV file |

---

## 11. Ethical Considerations & Limitations

- **Bias Reduction Scope:** Anonymous initial screening effectively removes explicit demographic cues (names, photographs, gender, addresses) during initial ranking. However, recruiters and developers must remain conscious of subtle indirect signals.
- **Scanned Resumes:** The platform parses standard text-based PDF and DOCX files. Image-only scanned PDFs require Optical Character Recognition (OCR); the platform clearly flags scanned files and allows manual candidate confirmation.
- **Verification of Experience:** While resume parsing extracts claims and assesses evidence, final hiring should combine competency scores with structured technical interviews.
