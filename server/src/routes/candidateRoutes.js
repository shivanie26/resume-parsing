const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  getMyApplications,
  getResumeSuggestionsForJob
} = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('candidate'));

router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);
router.get('/applications', getMyApplications);
router.get('/resume-suggestions/:jobId', getResumeSuggestionsForJob);

module.exports = router;
