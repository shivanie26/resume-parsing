const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  candidateId: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  extractedText: { type: String, required: true },
  parsedData: {
    name: { type: String, default: null },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    education: [{ 
      degree: String, 
      institution: String, 
      year: String 
    }],
    skills: [{ type: String }],
    programming_languages: [{ type: String }],
    tools: [{ type: String }],
    certifications: [{ type: String }],
    projects: [{ 
      title: String, 
      description: String, 
      technologies: [{ type: String }] 
    }],
    experience: [{ 
      company: String, 
      role: String, 
      duration: String, 
      description: String, 
      years: Number 
    }],
    total_experience: { type: Number, default: 0 }
  },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);
