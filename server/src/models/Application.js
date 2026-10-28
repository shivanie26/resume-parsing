const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
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
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true
    },
    status: {
      type: String,
      enum: [
        'Applied',
        'Under Review',
        'Assessment Pending',
        'Assessment Completed',
        'Shortlisted',
        'Interview',
        'Selected',
        'Rejected',
        'Withdrawn'
      ],
      default: 'Applied'
    },
    evaluation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CandidateEvaluation'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    recruiterNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
