import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components & Layouts
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CandidateLayout from './components/CandidateLayout';
import RecruiterLayout from './components/RecruiterLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/shared/JobList';
import JobDetails from './pages/shared/JobDetails';
import ApplicationDetails from './pages/shared/ApplicationDetails';
import NotFound from './pages/NotFound';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfile from './pages/candidate/CandidateProfile';
import ResumeUpload from './pages/candidate/ResumeUpload';
import ResumeReview from './pages/candidate/ResumeReview';
import JobMatchView from './pages/candidate/JobMatchView';
import AssessmentRunner from './pages/candidate/AssessmentRunner';
import AssessmentResultView from './pages/candidate/AssessmentResultView';
import ResumeImprovementView from './pages/candidate/ResumeImprovementView';
import MyApplications from './pages/candidate/MyApplications';
import JobMatching from './pages/candidate/JobMatching';
import CandidateAssessments from './pages/candidate/CandidateAssessments';
import CandidateResumeImprovement from './pages/candidate/CandidateResumeImprovement';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import JobManagement from './pages/recruiter/JobManagement';
import JobForm from './pages/recruiter/JobForm';
import JdAnalyzer from './pages/recruiter/JdAnalyzer';
import ApplicantListing from './pages/recruiter/ApplicantListing';
import CandidateRankings from './pages/recruiter/CandidateRankings';
import CandidateComparison from './pages/recruiter/CandidateComparison';
import RecruitmentReport from './pages/recruiter/RecruitmentReport';
import RecruiterCandidates from './pages/recruiter/RecruiterCandidates';
import RecruiterAssessments from './pages/recruiter/RecruiterAssessments';
import RecruiterAnalytics from './pages/recruiter/RecruiterAnalytics';
import RecruiterReports from './pages/recruiter/RecruiterReports';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';

function DashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === 'recruiter') {
    return <Navigate to="/recruiter/dashboard" replace />;
  }
  return <Navigate to="/candidate/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/:id" element={<JobDetails />} />

              {/* Role-Based Smart Dashboard Route */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                }
              />

              {/* Shared Protected Route */}
              <Route
                path="/applications/:id"
                element={
                  <ProtectedRoute>
                    <ApplicationDetails />
                  </ProtectedRoute>
                }
              />

              {/* Candidate Protected Routes (Wrapped in CandidateLayout Sidebar) */}
              <Route
                path="/candidate/dashboard"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateLayout>
                      <CandidateDashboard />
                    </CandidateLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/profile"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateLayout>
                      <CandidateProfile />
                    </CandidateLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/resume-upload"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateLayout>
                      <ResumeUpload />
                    </CandidateLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/resume-review"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateLayout>
                      <ResumeReview />
                    </CandidateLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/job-matching"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateLayout>
                      <JobMatching />
                    </CandidateLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/jobs/:id/match"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateLayout>
                      <JobMatchView />
                    </CandidateLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/assessments"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateLayout>
                      <CandidateAssessments />
                    </CandidateLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/assessments/:jobId"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateLayout>
                      <AssessmentRunner />
                    </CandidateLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/assessments/results/:attemptId"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateLayout>
                      <AssessmentResultView />
                    </CandidateLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/resume-improvement"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateLayout>
                      <CandidateResumeImprovement />
                    </CandidateLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/resume-improvement/:jobId"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateLayout>
                      <ResumeImprovementView />
                    </CandidateLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/applications"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateLayout>
                      <MyApplications />
                    </CandidateLayout>
                  </ProtectedRoute>
                }
              />

              {/* Recruiter Protected Routes (Wrapped in RecruiterLayout Sidebar) */}
              <Route
                path="/recruiter/dashboard"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <RecruiterDashboard />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/manage"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <JobManagement />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/create"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <JobForm />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/edit/:id"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <JobForm />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jd-analyzer"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <JdAnalyzer />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:jobId/applicants"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <ApplicantListing />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:jobId/rankings"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <CandidateRankings />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:jobId/compare"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <CandidateComparison />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/candidates"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <RecruiterCandidates />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/assessments"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <RecruiterAssessments />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/analytics"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <RecruiterAnalytics />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/reports"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <RecruiterReports />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/reports/:jobId"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <RecruitmentReport />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:jobId/report"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <RecruitmentReport />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/profile"
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <RecruiterProfile />
                    </RecruiterLayout>
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
