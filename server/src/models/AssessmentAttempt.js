const mongoose = require('mongoose');

const assessmentAttemptSchema = new mongoose.Schema(
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
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        questionText: String,
        selectedOptionIndex: Number,
        correctOptionIndex: Number, // saved upon evaluation
        isCorrect: Boolean,
        explanation: String
      }
    ],
    score: {
      type: Number,
      required: true,
      default: 0
    },
    totalQuestions: {
      type: Number,
      required: true,
      default: 0
    },
    percentage: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'timed-out'],
      default: 'completed'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Unique index to ensure one submitted attempt per candidate per job (or track attempts)
assessmentAttemptSchema.index({ candidate: 1, job: 1 });

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
