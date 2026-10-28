const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    contactDetails: {
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' }
    },
    summary: {
      type: String,
      default: ''
    },
    education: [
      {
        degree: { type: String, default: '' },
        institution: { type: String, default: '' },
        fieldOfStudy: { type: String, default: '' },
        startYear: { type: String, default: '' },
        endYear: { type: String, default: '' },
        year: { type: String, default: '' },
        grade: { type: String, default: '' }
      }
    ],
    skills: [
      {
        type: String,
        trim: true
      }
    ],
    experience: [
      {
        title: { type: String, default: '' },
        company: { type: String, default: '' },
        location: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' },
        technologies: [{ type: String }]
      }
    ],
    projects: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        technologies: [{ type: String }],
        link: { type: String, default: '' },
        role: { type: String, default: '' }
      }
    ],
    certifications: [
      {
        name: { type: String, default: '' },
        title: { type: String, default: '' },
        issuer: { type: String, default: '' },
        issueDate: { type: String, default: '' },
        year: { type: String, default: '' },
        url: { type: String, default: '' }
      }
    ],
    languages: [
      {
        type: String,
        trim: true
      }
    ],
    achievements: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
