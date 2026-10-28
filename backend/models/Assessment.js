const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  candidateId: { type: String, required: true },
  jobId: { type: String, required: true },
  skillScore: { type: Number, required: true },
  experienceScore: { type: Number, required: true },
  educationScore: { type: Number, required: true },
  projectScore: { type: Number, required: true },
  certificationScore: { type: Number, required: true },
  overallScore: { type: Number, required: true },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  evidence: [{
    skill: String,
    source: String,
    text: String
  }],
  confidence: { type: Number, default: 0.95 },
  explanation: { type: String },
  biasAudit: {
    evaluatedFactors: [{ type: String }],
    excludedAttributes: [{ type: String }],
    piiScrubbed: { type: Boolean, default: true },
    notice: { type: String, default: "AI-assisted assessment — final recruitment decision must be made by a human recruiter." }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);
