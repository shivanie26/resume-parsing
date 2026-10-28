const express = require('express');
const router = express.Router();
const { dbStorage } = require('../config/dbStorage');
const { authMiddleware } = require('../middleware/auth');

// GET /api/dashboard/recruiter - Aggregate metrics & charts data
router.get('/recruiter', authMiddleware, async (req, res) => {
  try {
    const jobs = await dbStorage.find('jobs');
    const resumes = await dbStorage.find('resumes');
    const assessments = await dbStorage.find('assessments');

    // Stats calculations
    const totalJobs = jobs.length;
    const totalResumes = resumes.length;
    const candidatesAssessed = assessments.length;

    const totalScoreSum = assessments.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
    const averageMatchScore = candidatesAssessed > 0 ? Math.round(totalScoreSum / candidatesAssessed) : 0;

    // Score distribution buckets
    const distribution = {
      '90-100%': 0,
      '80-89%': 0,
      '70-79%': 0,
      '< 70%': 0
    };

    assessments.forEach(a => {
      const s = a.overallScore || 0;
      if (s >= 90) distribution['90-100%']++;
      else if (s >= 80) distribution['80-89%']++;
      else if (s >= 70) distribution['70-79%']++;
      else distribution['< 70%']++;
    });

    // Top Candidate Leaderboard (Across all jobs)
    const sortedAssessments = [...assessments].sort((a, b) => b.overallScore - a.overallScore);
    const topCandidates = sortedAssessments.slice(0, 5).map(a => {
      const r = resumes.find(res => res.candidateId === a.candidateId) || {};
      return {
        candidateId: a.candidateId,
        name: a.candidateName || (r.parsedData && r.parsedData.name) || "Candidate",
        email: a.candidateEmail || (r.parsedData && r.parsedData.email),
        overallScore: a.overallScore,
        skillScore: a.skillScore,
        matchedSkillsCount: a.matchedSkills ? a.matchedSkills.length : 0
      };
    });

    // Skills in demand calculation from jobs & resumes
    const skillCounts = {};
    resumes.forEach(r => {
      if (r.parsedData && r.parsedData.skills) {
        r.parsedData.skills.forEach(s => {
          skillCounts[s] = (skillCounts[s] || 0) + 1;
        });
      }
    });

    const skillsInDemand = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Competency Category Average Breakdown
    let categoryAverages = {
      TechnicalSkills: 0,
      Experience: 0,
      Projects: 0,
      Education: 0,
      Certifications: 0
    };

    if (assessments.length > 0) {
      categoryAverages = {
        TechnicalSkills: Math.round(assessments.reduce((sum, a) => sum + (a.skillScore || 0), 0) / assessments.length),
        Experience: Math.round(assessments.reduce((sum, a) => sum + (a.experienceScore || 0), 0) / assessments.length),
        Projects: Math.round(assessments.reduce((sum, a) => sum + (a.projectScore || 0), 0) / assessments.length),
        Education: Math.round(assessments.reduce((sum, a) => sum + (a.educationScore || 0), 0) / assessments.length),
        Certifications: Math.round(assessments.reduce((sum, a) => sum + (a.certificationScore || 0), 0) / assessments.length)
      };
    }

    res.json({
      success: true,
      stats: {
        totalJobs,
        totalResumes,
        candidatesAssessed,
        averageMatchScore
      },
      distribution,
      topCandidates,
      skillsInDemand,
      categoryAverages,
      recentJobs: jobs.slice(-5).reverse()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to build dashboard metrics.', error: error.message });
  }
});

// GET /api/dashboard/candidate - Candidate personal dashboard details
router.get('/candidate', authMiddleware, async (req, res) => {
  try {
    const candidateId = req.user.id;
    const resumes = await dbStorage.find('resumes', { candidateId });
    const latestResume = resumes[resumes.length - 1] || null;

    const assessments = await dbStorage.find('assessments', { candidateId });
    const jobs = await dbStorage.find('jobs');

    // Missing skills recommendations based on available jobs
    const missingSkillsRecommendationSet = new Set();
    assessments.forEach(a => {
      if (a.missingSkills) {
        a.missingSkills.forEach(s => missingSkillsRecommendationSet.add(s));
      }
    });

    res.json({
      success: true,
      resume: latestResume,
      assessmentsCount: assessments.length,
      assessments,
      recommendedJobsCount: jobs.length,
      recommendedSkillsToLearn: Array.from(missingSkillsRecommendationSet)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load candidate dashboard.' });
  }
});

module.exports = router;
