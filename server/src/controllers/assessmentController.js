const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateEvaluation = require('../models/CandidateEvaluation');
const { calculateFinalScore } = require('../services/scoringService');
const defaultAssessments = require('../utils/defaultAssessments');

/**
 * Ensures default assessments are seeded into the database
 */
async function getOrCreateAssessment(role) {
  let assessment = await Assessment.findOne({ role });
  if (!assessment) {
    const defaultData = defaultAssessments.find(a => a.role === role) || defaultAssessments[0];
    assessment = await Assessment.create(defaultData);
  }
  return assessment;
}

/**
 * @route   GET /api/assessments/job/:jobId
 * @desc    Get assessment questions for a job (WITHOUT answers)
 * @access  Private (Candidate)
 */
const getAssessmentForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Check if candidate already completed this assessment
    const existingAttempt = await AssessmentAttempt.findOne({
      candidate: req.user.id,
      job: jobId,
      status: 'completed'
    });

    if (existingAttempt) {
      return res.status(200).json({
        success: true,
        alreadyCompleted: true,
        attemptId: existingAttempt._id,
        score: existingAttempt.score,
        totalQuestions: existingAttempt.totalQuestions,
        percentage: existingAttempt.percentage,
        message: 'You have already completed the competency assessment for this position.'
      });
    }

    // Role determined from job
    const assessmentRole = job.assessmentRole || 'fullstack';
    const assessment = await getOrCreateAssessment(assessmentRole);

    // Sanitize questions: map out questions without correctOptionIndex
    const sanitizedQuestions = assessment.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      difficulty: q.difficulty,
      skillTopic: q.skillTopic
    }));

    res.json({
      success: true,
      alreadyCompleted: false,
      assessment: {
        _id: assessment._id,
        title: assessment.title,
        description: assessment.description,
        durationMinutes: assessment.durationMinutes,
        role: assessment.role,
        questions: sanitizedQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/assessments/job/:jobId/submit
 * @desc    Submit answers, evaluate strictly on server-side, record attempt & update candidate evaluation
 * @access  Private (Candidate)
 */
const submitAssessment = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { answers } = req.body; // array of { questionId, selectedOptionIndex }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No answers provided for evaluation.'
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Check for duplicate submission
    const existingAttempt = await AssessmentAttempt.findOne({
      candidate: req.user.id,
      job: jobId,
      status: 'completed'
    });

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: 'Assessment already submitted and evaluated. Duplicate submissions are not allowed.'
      });
    }

    // Fetch assessment with correctOptionIndex explicitly selected
    const assessmentRole = job.assessmentRole || 'fullstack';
    let assessment = await Assessment.findOne({ role: assessmentRole }).select('+questions.correctOptionIndex');

    if (!assessment) {
      assessment = await getOrCreateAssessment(assessmentRole);
      assessment = await Assessment.findById(assessment._id).select('+questions.correctOptionIndex');
    }

    // Map questions for quick lookup
    const qMap = new Map();
    for (const q of assessment.questions) {
      qMap.set(q._id.toString(), q);
    }

    let correctCount = 0;
    const evaluatedAnswers = [];

    for (const ans of answers) {
      const q = qMap.get(ans.questionId.toString());
      if (q) {
        const isCorrect = Number(ans.selectedOptionIndex) === Number(q.correctOptionIndex);
        if (isCorrect) correctCount++;

        evaluatedAnswers.push({
          questionId: q._id,
          questionText: q.questionText,
          selectedOptionIndex: Number(ans.selectedOptionIndex),
          correctOptionIndex: q.correctOptionIndex,
          isCorrect,
          explanation: q.explanation
        });
      }
    }

    const totalQuestions = assessment.questions.length;
    // Assessment Percentage = (Correct Answers / Total Questions) * 100
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Save attempt
    const attempt = await AssessmentAttempt.create({
      candidate: req.user.id,
      job: jobId,
      assessment: assessment._id,
      answers: evaluatedAnswers,
      score: correctCount,
      totalQuestions,
      percentage,
      status: 'completed',
      completedAt: new Date()
    });

    // Update or recalculate CandidateEvaluation
    let evaluation = await CandidateEvaluation.findOne({ candidate: req.user.id, job: jobId });
    if (evaluation) {
      evaluation.assessmentScore = {
        score: percentage,
        completed: true,
        attempt: attempt._id,
        correctCount,
        totalQuestions
      };

      // Recalculate Final Score
      const finalResult = calculateFinalScore({
        skillMatchScore: evaluation.skillMatch.score,
        assessmentScore: percentage,
        isAssessmentCompleted: true,
        experienceProjectScore: evaluation.experienceProjectScore.score,
        skillMatchDetails: evaluation.skillMatch
      });

      evaluation.finalScore = finalResult.finalScore;
      evaluation.scoreBreakdown = finalResult.scoreBreakdown;
      evaluation.evaluationStatus = finalResult.evaluationStatus;
      evaluation.explanation = finalResult.explanation;
      await evaluation.save();
    }

    // Update Application status if exists
    const application = await Application.findOne({ candidate: req.user.id, job: jobId });
    if (application) {
      if (application.status === 'Applied' || application.status === 'Assessment Pending') {
        application.status = 'Assessment Completed';
        if (evaluation) application.evaluation = evaluation._id;
        await application.save();
      }
    }

    res.json({
      success: true,
      message: 'Assessment submitted and scored successfully.',
      attemptId: attempt._id,
      score: correctCount,
      totalQuestions,
      percentage,
      passed: percentage >= (assessment.passingScore || 60),
      evaluationUpdated: Boolean(evaluation)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/assessments/results/:id
 * @desc    Get assessment attempt results with explanation
 * @access  Private
 */
const getAssessmentResults = async (req, res, next) => {
  try {
    const attempt = await AssessmentAttempt.findById(req.params.id)
      .populate('job', 'title department targetRole')
      .populate('assessment', 'title role');

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt not found.' });
    }

    // Verify candidate or recruiter access
    if (req.user.role === 'candidate' && attempt.candidate.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({
      success: true,
      attempt
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssessmentForJob,
  submitAssessment,
  getAssessmentResults
};
