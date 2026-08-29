const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { dbStorage } = require('../config/dbStorage');
const { authMiddleware } = require('../middleware/auth');
const { extractTextFromFile, parseResumeText } = require('../services/parserService');

// Multer storage setup
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.docx', '.doc'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext) || file.mimetype.includes('pdf') || file.mimetype.includes('word')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF and DOCX documents are accepted.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/resumes/upload - Single or batch resume upload
router.post('/upload', authMiddleware, upload.array('resumes', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one resume file to upload.' });
    }

    const savedResumes = [];
    for (const file of req.files) {
      const rawText = await extractTextFromFile(file.path, file.mimetype);
      const parsedData = parseResumeText(rawText);

      // If recruiter uploads, create candidate profile entry if needed
      const candidateId = req.user.role === 'candidate' ? req.user.id : `cand_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

      const resumeRecord = await dbStorage.insert('resumes', {
        candidateId,
        fileName: file.originalname,
        filePath: file.path,
        extractedText: rawText,
        parsedData,
        uploadedAt: new Date().toISOString()
      });

      // Also ensure candidate user record exists for recruiter uploads
      const existingCandidateUser = await dbStorage.findById('users', candidateId);
      if (!existingCandidateUser && parsedData.name) {
        await dbStorage.insert('users', {
          _id: candidateId,
          name: parsedData.name,
          email: parsedData.email || `${candidateId}@candidate.local`,
          passwordHash: 'seeded_candidate',
          role: 'candidate'
        });
      }

      savedResumes.push(resumeRecord);
    }

    res.status(201).json({
      success: true,
      message: `Successfully processed ${savedResumes.length} resume(s).`,
      resumes: savedResumes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing uploaded resume file(s).', error: error.message });
  }
});

// GET /api/resumes/candidates - List candidates with filters
router.get('/candidates', authMiddleware, async (req, res) => {
  try {
    const resumes = await dbStorage.find('resumes');
    const { skill, minExperience } = req.query;

    let filtered = resumes;
    if (skill) {
      const sLower = skill.toLowerCase();
      filtered = filtered.filter(r => 
        r.parsedData && r.parsedData.skills && r.parsedData.skills.some(s => s.toLowerCase().includes(sLower))
      );
    }

    if (minExperience) {
      const expNum = parseFloat(minExperience);
      filtered = filtered.filter(r => r.parsedData && (r.parsedData.total_experience || 0) >= expNum);
    }

    res.json({ success: true, count: filtered.length, candidates: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch candidate resumes.' });
  }
});

// GET /api/resumes/:id - Get specific resume
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await dbStorage.findById('resumes', req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume document not found.' });
    }
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving resume record.' });
  }
});

module.exports = router;
