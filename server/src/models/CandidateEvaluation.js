const mongoose = require('mongoose');

const candidateEvaluationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      index: true
    },
    skillMatch: {
      score: { type: Number, default: 0 }, // 0 to 100
      matchedRequiredSkills: [{ type: String }],
      missingRequiredSkills: [{ type: String }],
      matchedPreferredSkills: [{ type: String }],
      additionalSkills: [{ type: String }],
      totalRequiredSkills: { type: Number, default: 0 },
      totalMatchedSkills: { type: Number, default: 0 }
    },
    assessmentScore: {
      score: { type: Number, default: 0 }, // 0 to 100
      completed: { type: Boolean, default: false },
      attempt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AssessmentAttempt'
      },
      correctCount: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 0 }
    },
    experienceProjectScore: {
      score: { type: Number, default: 0 }, // 0 to 100
      breakdown: {
        experienceScore: { type: Number, default: 0 },
        projectScore: { type: Number, default: 0 },
        skillEvidenceScore: { type: Number, default: 0 },
        educationScore: { type: Number, default: 0 }
      },
      details: [{ type: String }]
    },
    finalScore: {
      type: Number,
      default: 0
    },
    scoreBreakdown: {
      skillMatchContribution: { type: Number, default: 0 }, // Skill Match * 0.40
      assessmentContribution: { type: Number, default: 0 }, // Assessment * 0.40
      experienceContribution: { type: Number, default: 0 }  // Exp/Project * 0.20
    },
    evaluationStatus: {
      type: String,
      enum: ['pending-assessment', 'provisional', 'fully-evaluated'],
      default: 'pending-assessment'
    },
    explanation: {
      strengths: [{ type: String }],
      skillGaps: [{ type: String }],
      improvementAreas: [{ type: String }],
      summary: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

candidateEvaluationSchema.index({ candidate: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('CandidateEvaluation', candidateEvaluationSchema);
