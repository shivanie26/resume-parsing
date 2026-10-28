const express = require('express');
const router = express.Router();
const {
  getRecruiterAnalytics,
  getCandidateRankings,
  compareCandidates,
  getJobEvaluationReport,
  exportReportCSV,
  getAllRecruiterCandidates,
  getRecruiterAssessments,
  getRecruiterReportsOverview
} = require('../controllers/recruiterController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('recruiter'));

// Analytics & Candidates
router.get('/analytics', getRecruiterAnalytics);
router.get('/candidates', getAllRecruiterCandidates);
router.get('/assessments', getRecruiterAssessments);

// Reports
router.get('/reports', getRecruiterReportsOverview);
router.get('/reports/:jobId', getJobEvaluationReport);
router.get('/reports/:jobId/export', exportReportCSV);

// Job candidate actions & aliases
router.get('/jobs/:jobId/rankings', getCandidateRankings);
router.get('/jobs/:jobId/compare', compareCandidates);
router.get('/jobs/:jobId/report', getJobEvaluationReport);
router.get('/jobs/:jobId/report/export', exportReportCSV);

module.exports = router;
