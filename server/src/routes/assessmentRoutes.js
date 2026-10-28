const express = require('express');
const router = express.Router();
const {
  getAssessmentForJob,
  submitAssessment,
  getAssessmentResults
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/job/:jobId', getAssessmentForJob);
router.post('/job/:jobId/submit', submitAssessment);
router.get('/results/:id', getAssessmentResults);

module.exports = router;
