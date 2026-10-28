const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  getApplicationEvaluation
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Apply endpoint (nested in jobs or direct)
router.post('/jobs/:id/apply', authorize('candidate'), applyForJob);
router.get('/jobs/:id/applications', authorize('recruiter'), getJobApplications);

// Application specific routes
router.get('/:id', getApplicationById);
router.patch('/:id/status', authorize('recruiter'), updateApplicationStatus);
router.get('/:id/evaluation', getApplicationEvaluation);

module.exports = router;
