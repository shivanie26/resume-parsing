const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getResumeById,
  reParseResume,
  updateParsedData
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/:id', getResumeById);
router.post('/:id/parse', reParseResume);
router.put('/:id/parsed-data', updateParsedData);

module.exports = router;
