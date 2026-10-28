const express = require('express');
const router = express.Router();
const { submitContactForm, getContactMessages } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

// Public contact submission
router.post('/', submitContactForm);

// Recruiter/Admin view of messages
router.get('/messages', protect, authorize('recruiter'), getContactMessages);

module.exports = router;
