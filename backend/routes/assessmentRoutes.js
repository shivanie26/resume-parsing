const express = require('express');
const router = express.Router();
const { dbStorage } = require('../config/dbStorage');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { calculateAssessment } = require('../services/scoringEngine');

// POST /api/assessment/:jobId/:candidateId - Assess candidate against job
router.post('/:jobId/:candidateId', authMiddleware, async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;

    const job = await dbStorage.findById('jobs', jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    // Find candidate's resume
    const resumes = await dbStorage.find('resumes', { candidateId });
    const resume = resumes[resumes.length - 1] || await dbStorage.findById('resumes', candidateId);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Candidate resume not found.' });
    }

    const result = calculateAssessment(resume.parsedData, job, resume.extractedText);

    // Save or update Assessment record
    const existingAssessments = await dbStorage.find('assessments', { candidateId: resume.candidateId, jobId });
    let assessmentRecord;

    const assessmentPayload = {
      candidateId: resume.candidateId,
      jobId,
      candidateName: resume.parsedData.name || "Candidate",
      candidateEmail: resume.parsedData.email,
      ...result,
      createdAt: new Date().toISOString()
    };

    if (existingAssessments.length > 0) {
      assessmentRecord = await dbStorage.updateById('assessments', existingAssessments[0]._id, assessmentPayload);
    } else {
      assessmentRecord = await dbStorage.insert('assessments', assessmentPayload);
    }

    res.json({
      success: true,
      message: 'Competency assessment computed successfully.',
      assessment: assessmentRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Assessment computation error.', error: error.message });
  }
});

// POST /api/assessment/evaluate-all/:jobId - Batch evaluate all uploaded resumes for a job
router.post('/evaluate-all/:jobId', authMiddleware, requireRole('recruiter'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await dbStorage.findById('jobs', jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    const resumes = await dbStorage.find('resumes');
    const computedAssessments = [];

    for (const resume of resumes) {
      const result = calculateAssessment(resume.parsedData, job, resume.extractedText);
      const payload = {
        candidateId: resume.candidateId,
        jobId,
        candidateName: resume.parsedData.name || "Candidate",
        candidateEmail: resume.parsedData.email,
        resumeId: resume._id,
        ...result,
        createdAt: new Date().toISOString()
      };

      const existing = await dbStorage.find('assessments', { candidateId: resume.candidateId, jobId });
      let record;
      if (existing.length > 0) {
        record = await dbStorage.updateById('assessments', existing[0]._id, payload);
      } else {
        record = await dbStorage.insert('assessments', payload);
      }
      computedAssessments.push(record);
    }

    res.json({
      success: true,
      message: `Evaluated ${computedAssessments.length} candidate(s) against job "${job.title}".`,
      count: computedAssessments.length,
      assessments: computedAssessments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Batch assessment failed.', error: error.message });
  }
});

// GET /api/assessment/:jobId/:candidateId - Retrieve specific assessment
router.get('/:jobId/:candidateId', authMiddleware, async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;
    const assessments = await dbStorage.find('assessments', { jobId, candidateId });
    if (assessments.length === 0) {
      return res.status(404).json({ success: false, message: 'Assessment record not found.' });
    }
    res.json({ success: true, assessment: assessments[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving assessment.' });
  }
});

// GET /api/jobs/:jobId/rankings - Ranked candidate list for job
router.get('/job/:jobId/rankings', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const assessments = await dbStorage.find('assessments', { jobId });
    const resumes = await dbStorage.find('resumes');

    // Attach parsed resume data to each assessment for rich UI display
    const enrichedRankings = assessments.map(a => {
      const resume = resumes.find(r => r.candidateId === a.candidateId) || {};
      return {
        ...a,
        parsedData: resume.parsedData || {}
      };
    });

    // Sort descending by overallScore
    enrichedRankings.sort((a, b) => b.overallScore - a.overallScore);

    res.json({
      success: true,
      count: enrichedRankings.length,
      rankings: enrichedRankings,
      disclaimer: "AI-assisted assessment — final recruitment decision must be made by a human recruiter."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch candidate rankings.', error: error.message });
  }
});

// POST /api/candidates/compare - Side-by-side candidate comparison matrix (2-4 candidates)
router.post('/compare', authMiddleware, async (req, res) => {
  try {
    const { candidateIds, jobId } = req.body;

    if (!Array.isArray(candidateIds) || candidateIds.length < 2) {
      return res.status(400).json({ success: false, message: 'Please select between 2 and 4 candidates for comparison.' });
    }

    const comparisonData = [];
    for (const candId of candidateIds.slice(0, 4)) {
      const resumes = await dbStorage.find('resumes', { candidateId: candId });
      const resume = resumes[resumes.length - 1] || await dbStorage.findById('resumes', candId);

      let assessment = null;
      if (jobId) {
        const assessments = await dbStorage.find('assessments', { candidateId: candId, jobId });
        assessment = assessments[0] || null;
      }

      if (resume) {
        comparisonData.push({
          candidateId: candId,
          name: resume.parsedData.name || "Candidate",
          email: resume.parsedData.email,
          totalExperience: resume.parsedData.total_experience || 0,
          education: resume.parsedData.education[0] ? resume.parsedData.education[0].degree : "N/A",
          skills: resume.parsedData.skills || [],
          projectsCount: resume.parsedData.projects ? resume.parsedData.projects.length : 0,
          certificationsCount: resume.parsedData.certifications ? resume.parsedData.certifications.length : 0,
          assessment: assessment || {
            skillScore: 0,
            experienceScore: 0,
            projectScore: 0,
            educationScore: 0,
            certificationScore: 0,
            overallScore: 0,
            matchedSkills: [],
            missingSkills: []
          }
        });
      }
    }

    res.json({ success: true, count: comparisonData.length, comparison: comparisonData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Comparison error.', error: error.message });
  }
});

module.exports = router;
