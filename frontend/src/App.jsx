import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import CreateJobPage from './pages/CreateJobPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import ResumeParsingResultPage from './pages/ResumeParsingResultPage';
import CandidateListPage from './pages/CandidateListPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import CompetencyAssessmentPage from './pages/CompetencyAssessmentPage';
import RankingDashboardPage from './pages/RankingDashboardPage';
import CandidateComparisonPage from './pages/CandidateComparisonPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
              <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
              <Route path="/create-job" element={<CreateJobPage />} />
              <Route path="/upload-resume" element={<ResumeUploadPage />} />
              <Route path="/resume-parsed/:id" element={<ResumeParsingResultPage />} />
              <Route path="/candidates" element={<CandidateListPage />} />
              <Route path="/candidate-profile/:candidateId" element={<CandidateProfilePage />} />
              <Route path="/assessment/:jobId/:candidateId" element={<CompetencyAssessmentPage />} />
              <Route path="/job-rankings/:jobId" element={<RankingDashboardPage />} />
              <Route path="/compare" element={<CandidateComparisonPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
