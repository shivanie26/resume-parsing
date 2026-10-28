const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    department: {
      type: String,
      trim: true,
      default: 'Engineering'
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote'
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Hybrid'],
      default: 'Full-time'
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    targetRole: {
      type: String,
      enum: [
        'Full Stack Developer',
        'Frontend Developer',
        'Backend Developer',
        'Java Developer',
        'Python Developer',
        'AI/ML Engineer',
        'Data Analyst',
        'Custom'
      ],
      default: 'Full Stack Developer'
    },
    requiredSkills: {
      type: [String],
      required: [true, 'At least one required skill must be defined'],
      validate: [v => Array.isArray(v) && v.length > 0, 'Must have at least one required skill']
    },
    preferredSkills: {
      type: [String],
      default: []
    },
    minExperienceYears: {
      type: Number,
      default: 0,
      min: 0
    },
    educationRequirement: {
      type: String,
      default: 'Bachelor\'s degree in Computer Science, Engineering or related field'
    },
    assessmentRole: {
      type: String,
      enum: ['fullstack', 'java', 'aiml', 'frontend', 'backend', 'data-analyst', 'none'],
      default: 'fullstack'
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'closed'],
      default: 'active'
    },
    deadline: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

jobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);
