const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    originalFilename: {
      type: String,
      required: true
    },
    storedFilename: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      default: 0
    },
    mimeType: {
      type: String,
      required: true
    },
    extractedText: {
      type: String,
      default: ''
    },
    parsedData: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      summary: { type: String, default: '' },
      education: [
        {
          degree: { type: String, default: '' },
          institution: { type: String, default: '' },
          fieldOfStudy: { type: String, default: '' },
          year: { type: String, default: '' }
        }
      ],
      skills: [{ type: String }],
      experience: [
        {
          title: { type: String, default: '' },
          company: { type: String, default: '' },
          duration: { type: String, default: '' },
          description: { type: String, default: '' },
          skillsIdentified: [{ type: String }]
        }
      ],
      projects: [
        {
          title: { type: String, default: '' },
          description: { type: String, default: '' },
          technologies: [{ type: String }]
        }
      ],
      certifications: [
        {
          title: { type: String, default: '' },
          issuer: { type: String, default: '' }
        }
      ],
      achievements: [{ type: String }]
    },
    parsingStatus: {
      type: String,
      enum: ['uploaded', 'processing', 'completed', 'failed'],
      default: 'uploaded'
    },
    parsingErrors: [{ type: String }]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Resume', resumeSchema);
