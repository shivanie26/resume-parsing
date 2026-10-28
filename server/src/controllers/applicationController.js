const Application = require('../models/Application');
const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
const CandidateEvaluation = require('../models/CandidateEvaluation');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const CandidateProfile = require('../models/CandidateProfile');
const User = require('../models/User');

const { calculateSkillMatch } = require('../services/skillMatchingService');
const { calculateExperienceProjectScore, calculateFinalScore } = require('../services/scoringService');

/**
 * Valid allowed status transitions
 */
const VALID_STATUSES = [
  'Applied',
  'Under Review',
  'Assessment Pending',
  'Assessment Completed',
  'Shortlisted',
  'Interview',
  'Selected',
  'Rejected',
  'Withdrawn'
];

/**
 * @route   POST /api/jobs/:id/apply
 * @desc    Apply for a job, compute transparent initial evaluation
 * @access  Private (Candidate)
 */
const applyForJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const candidateId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This job posting is no longer active.' });
    }

    // Check duplicate application
    const existingApplication = await Application.findOne({ candidate: candidateId, job: jobId });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this position.'
      });
    }

    // Get candidate's latest resume or profile
    const resume = await Resume.findOne({ candidate: candidateId }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'Please upload and parse your resume before submitting a job application.'
      });
    }

    const profile = await CandidateProfile.findOne({ user: candidateId });
    const candidateData = resume.parsedData || profile || {};
    const candidateSkills = candidateData.skills || [];

    // 1. Calculate Skill Match
    const skillMatch = calculateSkillMatch(candidateSkills, job.requiredSkills, job.preferredSkills);

    // 2. Calculate Experience & Project Score
    const expProjResult = calculateExperienceProjectScore(candidateData, job);

    // 3. Check if Candidate has already completed assessment for this job
    const assessmentAttempt = await AssessmentAttempt.findOne({
      candidate: candidateId,
      job: jobId,
      status: 'completed'
    });

    const isAssessmentCompleted = Boolean(assessmentAttempt);
    const assessmentScoreVal = assessmentAttempt ? assessmentAttempt.percentage : null;

    // 4. Calculate Final Score
    const finalResult = calculateFinalScore({
      skillMatchScore: skillMatch.score,
      assessmentScore: assessmentScoreVal,
      isAssessmentCompleted,
      experienceProjectScore: expProjResult.score,
      skillMatchDetails: skillMatch
    });

    // 5. Create or Update CandidateEvaluation
    const evaluation = await CandidateEvaluation.findOneAndUpdate(
      { candidate: candidateId, job: jobId },
      {
        candidate: candidateId,
        job: jobId,
        skillMatch: {
          score: skillMatch.score,
          matchedRequiredSkills: skillMatch.matchedRequiredSkills,
          missingRequiredSkills: skillMatch.missingRequiredSkills,
          matchedPreferredSkills: skillMatch.matchedPreferredSkills,
          additionalSkills: skillMatch.additionalSkills,
          totalRequiredSkills: skillMatch.totalRequiredSkills,
          totalMatchedSkills: skillMatch.totalMatchedSkills
        },
        assessmentScore: {
          score: isAssessmentCompleted ? assessmentAttempt.percentage : 0,
          completed: isAssessmentCompleted,
          attempt: assessmentAttempt ? assessmentAttempt._id : null,
          correctCount: assessmentAttempt ? assessmentAttempt.score : 0,
          totalQuestions: assessmentAttempt ? assessmentAttempt.totalQuestions : 0
        },
        experienceProjectScore: {
          score: expProjResult.score,
          breakdown: expProjResult.breakdown,
          details: expProjResult.details
        },
        finalScore: finalResult.finalScore,
        scoreBreakdown: finalResult.scoreBreakdown,
        evaluationStatus: finalResult.evaluationStatus,
        explanation: finalResult.explanation
      },
      { upsert: true, new: true }
    );

    // Initial application status based on assessment necessity
    const initialStatus = isAssessmentCompleted ? 'Assessment Completed' : 'Assessment Pending';

    // 6. Create Application record
    const application = await Application.create({
      candidate: candidateId,
      job: jobId,
      resume: resume._id,
      status: initialStatus,
      evaluation: evaluation._id
    });

    // Update evaluation with application reference
    evaluation.application = application._id;
    await evaluation.save();

    // 7. Record History
    await ApplicationStatusHistory.create({
      application: application._id,
      previousStatus: 'None',
      newStatus: initialStatus,
      changedBy: candidateId,
      comment: 'Candidate submitted application with parsed resume.'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application,
      evaluation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/jobs/:id/applications
 * @desc    Recruiter views applicants for a job (Supports Anonymous Initial Screening)
 * @access  Private (Recruiter)
 */
const getJobApplications = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const { status, minScore, unmask } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only view applications for your own jobs.'
      });
    }

    const filter = { job: jobId };
    if (status) filter.status = status;

    let applications = await Application.find(filter)
      .populate('candidate', 'candidateId name email createdAt')
      .populate('resume')
      .populate('evaluation')
      .sort({ appliedAt: -1 });

    // Filter by minScore if requested
    if (minScore) {
      applications = applications.filter(
        app => app.evaluation && app.evaluation.finalScore >= Number(minScore)
      );
    }

    // Anonymous Initial Screening: Mask identifying information unless recruiter explicitly unmasks for interview/selection
    const sanitizedApplications = applications.map(app => {
      const isUnmasked = unmask === 'true' || app.status === 'Interview' || app.status === 'Selected';
      const cand = app.candidate || {};

      return {
        _id: app._id,
        candidateId: cand.candidateId || `CAND-${cand._id?.toString().slice(-4)}`,
        // Identity masked during initial screening
        candidateName: isUnmasked ? cand.name : 'Anonymous Candidate',
        candidateEmail: isUnmasked ? cand.email : 'contact-masked@smartresume.secure',
        isAnonymousScreening: !isUnmasked,
        status: app.status,
        appliedAt: app.appliedAt,
        resumeId: app.resume?._id,
        evaluation: app.evaluation,
        recruiterNotes: app.recruiterNotes
      };
    });

    res.json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        department: job.department,
        status: job.status
      },
      count: sanitizedApplications.length,
      applications: sanitizedApplications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/applications/:id
 * @desc    Get detailed application by ID
 * @access  Private
 */
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate', 'candidateId name email')
      .populate('resume')
      .populate('evaluation');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Role check
    const isOwnerCandidate = req.user.role === 'candidate' && application.candidate._id.toString() === req.user.id;
    const isJobRecruiter = req.user.role === 'recruiter' && application.job.recruiter.toString() === req.user.id;

    if (!isOwnerCandidate && !isJobRecruiter) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const history = await ApplicationStatusHistory.find({ application: application._id })
      .populate('changedBy', 'name role')
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      application,
      history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/applications/:id/status
 * @desc    Recruiter updates applicant status
 * @access  Private (Recruiter)
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, comment, recruiterNotes } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Allowed values are: ${VALID_STATUSES.join(', ')}`
      });
    }

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only manage applications for your own jobs.'
      });
    }

    const previousStatus = application.status;
    application.status = status;
    if (recruiterNotes !== undefined) application.recruiterNotes = recruiterNotes;
    await application.save();

    // Record status history
    await ApplicationStatusHistory.create({
      application: application._id,
      previousStatus,
      newStatus: status,
      changedBy: req.user.id,
      comment: comment || `Status updated from ${previousStatus} to ${status}`
    });

    res.json({
      success: true,
      message: `Application status updated to ${status}.`,
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/applications/:id/evaluation
 * @desc    Get explainable candidate evaluation details
 * @access  Private
 */
const getApplicationEvaluation = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('evaluation');
    if (!application || !application.evaluation) {
      return res.status(404).json({ success: false, message: 'Evaluation details not found for this application.' });
    }

    res.json({
      success: true,
      evaluation: application.evaluation
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  getApplicationEvaluation
};
