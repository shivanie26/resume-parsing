const express = require('express');
const router = express.Router();
const { dbStorage } = require('../config/dbStorage');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/jobs - List all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await dbStorage.find('jobs');
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch jobs.', error: error.message });
  }
});

// GET /api/jobs/:id - Get specific job
router.get('/:id', async (req, res) => {
  try {
    const job = await dbStorage.findById('jobs', req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving job details.' });
  }
});

// POST /api/jobs - Create job (Recruiter only)
router.post('/', authMiddleware, requireRole('recruiter'), async (req, res) => {
  try {
    const {
      title,
      description,
      requiredSkills,
      preferredSkills,
      experienceRequirement,
      educationRequirement,
      competencyWeights
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Job title and description are required.' });
    }

    const parseSkills = (input) => {
      if (Array.isArray(input)) return input.map(s => s.trim()).filter(Boolean);
      if (typeof input === 'string') return input.split(',').map(s => s.trim()).filter(Boolean);
      return [];
    };

    const newJob = await dbStorage.insert('jobs', {
      recruiterId: req.user.id,
      title,
      description,
      requiredSkills: parseSkills(requiredSkills),
      preferredSkills: parseSkills(preferredSkills),
      experienceRequirement: Number(experienceRequirement) || 0,
      educationRequirement: educationRequirement || "Bachelor's Degree in Computer Science or related field",
      competencyWeights: competencyWeights || {
        technicalSkills: 40,
        relevantExperience: 25,
        projects: 15,
        education: 10,
        certifications: 10
      }
    });

    res.status(201).json({ success: true, message: 'Job created successfully.', job: newJob });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create job posting.', error: error.message });
  }
});

// PUT /api/jobs/:id - Update job / weighting parameters (Recruiter only)
router.put('/:id', authMiddleware, requireRole('recruiter'), async (req, res) => {
  try {
    const existingJob = await dbStorage.findById('jobs', req.params.id);
    if (!existingJob) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    const updatedJob = await dbStorage.updateById('jobs', req.params.id, req.body);
    res.json({ success: true, message: 'Job updated successfully.', job: updatedJob });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update job posting.' });
  }
});

// DELETE /api/jobs/:id - Delete job (Recruiter only)
router.delete('/:id', authMiddleware, requireRole('recruiter'), async (req, res) => {
  try {
    const deleted = await dbStorage.deleteById('jobs', req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }
    res.json({ success: true, message: 'Job posting deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete job posting.' });
  }
});

module.exports = router;
