const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  parseJobDescription,
  matchCandidateSkills
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getJobs);
router.get('/:id', getJobById);

// Recruiter actions
router.post('/parse-jd', protect, authorize('recruiter'), parseJobDescription);
router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);
router.get('/:id/applications', protect, authorize('recruiter'), require('../controllers/applicationController').getJobApplications);

// Candidate matching action
router.post('/:id/match', protect, authorize('candidate'), matchCandidateSkills);

module.exports = router;
