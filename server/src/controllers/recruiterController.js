const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateEvaluation = require('../models/CandidateEvaluation');
const User = require('../models/User');

/**
 * @route   GET /api/recruiter/analytics
 * @desc    Get real-time recruiter recruitment analytics from MongoDB
 * @access  Private (Recruiter)
 */
const getRecruiterAnalytics = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;

    // 1. Fetch recruiter jobs
    const jobs = await Job.find({ recruiter: recruiterId });
    const jobIds = jobs.map(j => j._id);

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'active').length;

    // 2. Fetch applications for these jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('evaluation')
      .populate('candidate', 'candidateId name');

    const totalApplications = applications.length;

    const pendingAssessments = applications.filter(
      a => a.status === 'Assessment Pending' || (a.evaluation && a.evaluation.evaluationStatus === 'pending-assessment')
    ).length;

    const completedAssessments = applications.filter(
      a => a.evaluation && a.evaluation.assessmentScore?.completed
    ).length;

    const shortlistedCandidates = applications.filter(
      a => a.status === 'Shortlisted' || a.status === 'Interview' || a.status === 'Selected'
    ).length;

    // 3. Average Skill Match Percentage
    let totalSkillScore = 0;
    let skillScoreCount = 0;
    applications.forEach(a => {
      if (a.evaluation && typeof a.evaluation.skillMatch?.score === 'number') {
        totalSkillScore += a.evaluation.skillMatch.score;
        skillScoreCount++;
      }
    });
    const avgSkillMatch = skillScoreCount > 0 ? Math.round(totalSkillScore / skillScoreCount) : 0;

    // 4. Score Distribution Buckets (0-40, 41-60, 61-80, 81-100)
    const scoreDistribution = [
      { range: '0-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 }
    ];

    applications.forEach(a => {
      if (a.evaluation && typeof a.evaluation.finalScore === 'number') {
        const score = a.evaluation.finalScore;
        if (score <= 40) scoreDistribution[0].count++;
        else if (score <= 60) scoreDistribution[1].count++;
        else if (score <= 80) scoreDistribution[2].count++;
        else scoreDistribution[3].count++;
      }
    });

    // 5. Job-wise Statistics
    const jobWiseStats = jobs.map(j => {
      const jobApps = applications.filter(a => a.job.toString() === j._id.toString());
      const jobEvaluated = jobApps.filter(a => a.evaluation && a.evaluation.evaluationStatus === 'fully-evaluated');
      let avgScore = 0;
      if (jobApps.length > 0) {
        const sum = jobApps.reduce((acc, curr) => acc + (curr.evaluation?.finalScore || 0), 0);
        avgScore = Math.round(sum / jobApps.length);
      }

      return {
        jobId: j._id,
        title: j.title,
        targetRole: j.targetRole,
        totalApplicants: jobApps.length,
        fullyEvaluated: jobEvaluated.length,
        avgScore
      };
    });

    // 6. Recent Applications (masked candidate names for initial screen)
    const recentApplications = applications
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
      .slice(0, 5)
      .map(app => ({
        id: app._id,
        candidateId: app.candidate?.candidateId || 'CAND-XXXX',
        candidateName: 'Anonymous Candidate',
        jobTitle: jobs.find(j => j._id.toString() === app.job.toString())?.title || 'Unknown Role',
        status: app.status,
        finalScore: app.evaluation?.finalScore || 0,
        evaluationStatus: app.evaluation?.evaluationStatus || 'pending-assessment',
        appliedAt: app.appliedAt
      }));

    res.json({
      success: true,
      analytics: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingAssessments,
        completedAssessments,
        shortlistedCandidates,
        avgSkillMatch,
        scoreDistribution,
        jobWiseStats,
        recentApplications
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/recruiter/jobs/:jobId/rankings
 * @desc    Get candidates ranked deterministically with explainable score components
 * @access  Private (Recruiter)
 */
const getCandidateRankings = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, assessmentFilter, minSkillMatch } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to job candidates.' });
    }

    const filter = { job: jobId };
    if (status) filter.status = status;

    let applications = await Application.find(filter)
      .populate('candidate', 'candidateId name email createdAt')
      .populate('evaluation');

    // Filter by assessment completion status if specified
    if (assessmentFilter === 'completed') {
      applications = applications.filter(a => a.evaluation?.assessmentScore?.completed);
    } else if (assessmentFilter === 'pending') {
      applications = applications.filter(a => !a.evaluation?.assessmentScore?.completed);
    }

    // Filter by minSkillMatch
    if (minSkillMatch) {
      applications = applications.filter(
        a => (a.evaluation?.skillMatch?.score || 0) >= Number(minSkillMatch)
      );
    }

    // Deterministic Explainable Sorting:
    // Fully evaluated candidates sorted by finalScore DESC, then pending assessment candidates
    applications.sort((a, b) => {
      const aEval = a.evaluation?.evaluationStatus === 'fully-evaluated' ? 1 : 0;
      const bEval = b.evaluation?.evaluationStatus === 'fully-evaluated' ? 1 : 0;

      if (aEval !== bEval) return bEval - aEval; // fully evaluated first
      return (b.evaluation?.finalScore || 0) - (a.evaluation?.finalScore || 0);
    });

    const rankedCandidates = applications.map((app, index) => {
      const cand = app.candidate || {};
      const evalData = app.evaluation || {};

      return {
        rank: index + 1,
        applicationId: app._id,
        candidateId: cand.candidateId || `CAND-${cand._id?.toString().slice(-4)}`,
        // Anonymous screening: name masked unless interview/selected
        candidateName: (app.status === 'Interview' || app.status === 'Selected') ? cand.name : 'Anonymous Candidate',
        applicationStatus: app.status,
        evaluationStatus: evalData.evaluationStatus || 'pending-assessment',
        isFullyEvaluated: evalData.evaluationStatus === 'fully-evaluated',
        skillMatchScore: evalData.skillMatch?.score || 0,
        skillMatchContribution: evalData.scoreBreakdown?.skillMatchContribution || 0,
        assessmentScore: evalData.assessmentScore?.completed ? evalData.assessmentScore.score : null,
        assessmentContribution: evalData.scoreBreakdown?.assessmentContribution || 0,
        experienceScore: evalData.experienceProjectScore?.score || 0,
        experienceContribution: evalData.scoreBreakdown?.experienceContribution || 0,
        finalScore: evalData.finalScore || 0,
        matchedSkills: evalData.skillMatch?.matchedRequiredSkills || [],
        missingSkills: evalData.skillMatch?.missingRequiredSkills || [],
        explanation: evalData.explanation || {},
        appliedAt: app.appliedAt
      };
    });

    res.json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        requiredSkills: job.requiredSkills
      },
      count: rankedCandidates.length,
      rankings: rankedCandidates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/recruiter/jobs/:jobId/compare
 * @desc    Compare multiple candidates side by side (up to 4)
 * @access  Private (Recruiter)
 */
const compareCandidates = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { applicationIds } = req.query; // comma separated IDs

    if (!applicationIds) {
      return res.status(400).json({
        success: false,
        message: 'Please provide applicationIds to compare (e.g. ?applicationIds=id1,id2).'
      });
    }

    const ids = applicationIds.split(',').map(id => id.trim()).filter(Boolean);
    if (ids.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least 2 candidates to compare.'
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const applications = await Application.find({ _id: { $in: ids }, job: jobId })
      .populate('candidate', 'candidateId name')
      .populate('evaluation')
      .populate('resume');

    const comparisonList = applications.map(app => {
      const evalData = app.evaluation || {};
      const cand = app.candidate || {};

      return {
        applicationId: app._id,
        candidateId: cand.candidateId || `CAND-${cand._id?.toString().slice(-4)}`,
        candidateName: (app.status === 'Interview' || app.status === 'Selected') ? cand.name : 'Anonymous Candidate',
        status: app.status,
        finalScore: evalData.finalScore || 0,
        evaluationStatus: evalData.evaluationStatus || 'pending-assessment',
        skillMatch: {
          score: evalData.skillMatch?.score || 0,
          matchedRequired: evalData.skillMatch?.matchedRequiredSkills || [],
          missingRequired: evalData.skillMatch?.missingRequiredSkills || [],
          matchedPreferred: evalData.skillMatch?.matchedPreferredSkills || []
        },
        assessment: {
          score: evalData.assessmentScore?.completed ? evalData.assessmentScore.score : 'Pending',
          completed: Boolean(evalData.assessmentScore?.completed),
          correctAnswers: evalData.assessmentScore?.correctCount || 0,
          totalQuestions: evalData.assessmentScore?.totalQuestions || 0
        },
        experienceAndProjects: {
          score: evalData.experienceProjectScore?.score || 0,
          breakdown: evalData.experienceProjectScore?.breakdown || {},
          details: evalData.experienceProjectScore?.details || []
        },
        strengths: evalData.explanation?.strengths || [],
        skillGaps: evalData.explanation?.skillGaps || []
      };
    });

    res.json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        requiredSkills: job.requiredSkills,
        preferredSkills: job.preferredSkills
      },
      candidates: comparisonList
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/recruiter/reports/:jobId
 * @desc    Get complete candidate evaluation report for a job
 * @access  Private (Recruiter)
 */
const getJobEvaluationReport = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('candidate', 'candidateId name email')
      .populate('evaluation')
      .sort({ 'evaluation.finalScore': -1 });

    const reportRows = applications.map((app, index) => {
      const evalData = app.evaluation || {};
      const cand = app.candidate || {};

      return {
        rank: index + 1,
        candidateId: cand.candidateId || `CAND-${cand._id?.toString().slice(-4)}`,
        candidateName: (app.status === 'Interview' || app.status === 'Selected') ? cand.name : 'Anonymous Candidate',
        status: app.status,
        skillMatchPercentage: `${evalData.skillMatch?.score || 0}%`,
        assessmentScore: evalData.assessmentScore?.completed ? `${evalData.assessmentScore.score}%` : 'Pending',
        experienceScore: `${evalData.experienceProjectScore?.score || 0}/100`,
        finalScore: evalData.finalScore || 0,
        matchedSkills: (evalData.skillMatch?.matchedRequiredSkills || []).join('; '),
        missingSkills: (evalData.skillMatch?.missingRequiredSkills || []).join('; '),
        summary: evalData.explanation?.summary || 'Pending full evaluation'
      };
    });

    res.json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        targetRole: job.targetRole,
        department: job.department,
        requiredSkills: job.requiredSkills
      },
      generatedAt: new Date(),
      totalCandidates: reportRows.length,
      reportRows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/recruiter/reports/:jobId/export
 * @desc    Export candidate evaluation report as CSV file
 * @access  Private (Recruiter)
 */
const exportReportCSV = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('candidate', 'candidateId name')
      .populate('evaluation');

    // Sort by final score
    applications.sort((a, b) => (b.evaluation?.finalScore || 0) - (a.evaluation?.finalScore || 0));

    // Build CSV Content
    const headers = [
      'Rank',
      'Candidate ID',
      'Candidate Name',
      'Status',
      'Skill Match (%)',
      'Assessment Score (%)',
      'Experience/Project Score',
      'Final Score (0-100)',
      'Matched Required Skills',
      'Missing Required Skills',
      'Evaluation Summary'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const csvRows = [headers.join(',')];

    applications.forEach((app, index) => {
      const evalData = app.evaluation || {};
      const cand = app.candidate || {};
      const isUnmasked = app.status === 'Interview' || app.status === 'Selected';

      const row = [
        index + 1,
        escapeCsv(cand.candidateId || `CAND-${cand._id?.toString().slice(-4)}`),
        escapeCsv(isUnmasked ? cand.name : 'Anonymous Candidate'),
        escapeCsv(app.status),
        escapeCsv(`${evalData.skillMatch?.score || 0}%`),
        escapeCsv(evalData.assessmentScore?.completed ? `${evalData.assessmentScore.score}%` : 'Pending'),
        escapeCsv(`${evalData.experienceProjectScore?.score || 0}/100`),
        escapeCsv(evalData.finalScore || 0),
        escapeCsv((evalData.skillMatch?.matchedRequiredSkills || []).join('; ')),
        escapeCsv((evalData.skillMatch?.missingRequiredSkills || []).join('; ')),
        escapeCsv(evalData.explanation?.summary || 'Pending full evaluation')
      ];
      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\r\n');
    const safeTitle = job.title.replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Recruitment_Report_${safeTitle}.csv`);
    return res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/recruiter/candidates
 * @desc    Get all candidate applications across all recruiter's jobs with filters
 * @access  Private (Recruiter)
 */
const getAllRecruiterCandidates = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const { jobId, status, search } = req.query;

    const jobs = await Job.find({ recruiter: recruiterId }).select('title department targetRole type location');
    const jobIds = jobs.map(j => j._id);

    const query = { job: { $in: jobIds } };
    if (jobId && jobId !== 'all') {
      query.job = jobId;
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    let applications = await Application.find(query)
      .populate('job', 'title department targetRole type location')
      .populate('candidate', 'candidateId name email')
      .populate('evaluation')
      .populate('resume', 'fileName originalName fileUrl')
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      applications = applications.filter(app => {
        const cId = (app.candidate?.candidateId || '').toLowerCase();
        const cName = (app.candidate?.name || '').toLowerCase();
        const jTitle = (app.job?.title || '').toLowerCase();
        return cId.includes(s) || cName.includes(s) || jTitle.includes(s);
      });
    }

    const candidateList = applications.map(app => {
      const evalData = app.evaluation || {};
      const cand = app.candidate || {};
      const isUnmasked = app.status === 'Interview' || app.status === 'Selected';

      return {
        _id: app._id,
        candidateId: cand.candidateId || `CAND-${cand._id?.toString().slice(-4)}`,
        candidateName: isUnmasked ? cand.name : 'Anonymous Candidate',
        email: isUnmasked ? cand.email : '***@protected.local',
        job: app.job,
        status: app.status,
        evaluationStatus: evalData.evaluationStatus || 'pending-assessment',
        skillMatchScore: evalData.skillMatch?.score || 0,
        assessmentScore: evalData.assessmentScore?.completed ? evalData.assessmentScore.score : null,
        experienceScore: evalData.experienceProjectScore?.score || 0,
        finalScore: evalData.finalScore || 0,
        matchedSkills: evalData.skillMatch?.matchedRequiredSkills || [],
        missingSkills: evalData.skillMatch?.missingRequiredSkills || [],
        appliedAt: app.createdAt || app.appliedAt,
        resumeId: app.resume?._id
      };
    });

    res.json({
      success: true,
      jobs,
      candidates: candidateList,
      total: candidateList.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/recruiter/assessments
 * @desc    Get assessment question banks and role benchmarks
 * @access  Private (Recruiter)
 */
const getRecruiterAssessments = async (req, res, next) => {
  try {
    const Assessment = require('../models/Assessment');
    const defaultAssessments = require('../utils/defaultAssessments');

    let dbAssessments = await Assessment.find({});
    if (!dbAssessments || dbAssessments.length === 0) {
      try {
        dbAssessments = await Assessment.insertMany(defaultAssessments);
      } catch (err) {
        dbAssessments = defaultAssessments;
      }
    }

    const assessments = dbAssessments.map(a => ({
      _id: a._id || a.role,
      role: a.role,
      title: a.title,
      description: a.description,
      durationMinutes: a.durationMinutes || 15,
      passingScore: a.passingScore || 60,
      totalQuestions: a.questions ? a.questions.length : 0,
      questions: (a.questions || []).map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        difficulty: q.difficulty || 'medium',
        skillTopic: q.skillTopic || 'General',
        explanation: q.explanation || ''
      }))
    }));

    res.json({
      success: true,
      assessments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/recruiter/reports
 * @desc    Get reports summary for all recruiter jobs
 * @access  Private (Recruiter)
 */
const getRecruiterReportsOverview = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const jobs = await Job.find({ recruiter: recruiterId }).sort({ createdAt: -1 });
    const jobIds = jobs.map(j => j._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('evaluation');

    const jobReports = jobs.map(job => {
      const jobApps = applications.filter(a => a.job.toString() === job._id.toString());
      const evaluatedApps = jobApps.filter(a => a.evaluation && a.evaluation.evaluationStatus === 'fully-evaluated');
      const scores = jobApps.map(a => a.evaluation?.finalScore || 0);
      const topScore = scores.length > 0 ? Math.max(...scores) : 0;
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const shortlisted = jobApps.filter(a => ['Shortlisted', 'Interview', 'Selected'].includes(a.status)).length;

      return {
        jobId: job._id,
        title: job.title,
        department: job.department,
        targetRole: job.targetRole,
        type: job.type,
        status: job.status,
        assessmentRole: job.assessmentRole,
        totalApplicants: jobApps.length,
        fullyEvaluated: evaluatedApps.length,
        topScore,
        avgScore,
        shortlistedCount: shortlisted,
        createdAt: job.createdAt
      };
    });

    res.json({
      success: true,
      totalJobs: jobs.length,
      totalApplicants: applications.length,
      reports: jobReports
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecruiterAnalytics,
  getCandidateRankings,
  compareCandidates,
  getJobEvaluationReport,
  exportReportCSV,
  getAllRecruiterCandidates,
  getRecruiterAssessments,
  getRecruiterReportsOverview
};
