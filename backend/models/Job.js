const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiterId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  preferredSkills: [{ type: String }],
  experienceRequirement: { type: Number, default: 0 },
  educationRequirement: { type: String, default: "Bachelor's Degree in Computer Science or related field" },
  competencyWeights: {
    technicalSkills: { type: Number, default: 40 },
    relevantExperience: { type: Number, default: 25 },
    projects: { type: Number, default: 15 },
    education: { type: Number, default: 10 },
    certifications: { type: Number, default: 10 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Job || mongoose.model('Job', jobSchema);
