const Job = require('../models/Job');
const Resume = require('../models/Resume');
const CandidateProfile = require('../models/CandidateProfile');
const { extractSkillsFromText, normalizeSkill } = require('../utils/skillDictionary');
const { calculateSkillMatch } = require('../services/skillMatchingService');

/**
 * @route   GET /api/jobs
 * @desc    Get all jobs (public for candidates/recruiters with filtering)
 * @access  Public / Private
 */
const getJobs = async (req, res, next) => {
  try {
    const { search, targetRole, type, status } = req.query;
    const query = {};

    // By default for non-recruiters or candidates, only show active jobs
    if (status) {
      query.status = status;
    } else if (!req.user || req.user.role !== 'recruiter') {
      query.status = 'active';
    }

    if (targetRole) {
      query.targetRole = targetRole;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('recruiter', 'name company')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/jobs/:id
 * @desc    Get single job by ID
 * @access  Public / Private
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name email company');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/jobs
 * @desc    Create a new job
 * @access  Private (Recruiter)
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      department,
      location,
      type,
      description,
      targetRole,
      requiredSkills,
      preferredSkills,
      minExperienceYears,
      educationRequirement,
      assessmentRole,
      deadline
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide job title and description.'
      });
    }

    // Process and normalize required and preferred skills
    const normalizedReq = (requiredSkills || []).map(s => normalizeSkill(s)).filter(Boolean);
    const normalizedPref = (preferredSkills || []).map(s => normalizeSkill(s)).filter(Boolean);

    if (normalizedReq.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one required skill must be defined for this job.'
      });
    }

    // Determine assessment role if not specified
    let assessedRole = assessmentRole;
    if (!assessedRole || assessedRole === 'auto') {
      const titleLower = title.toLowerCase();
      if (titleLower.includes('java')) assessedRole = 'java';
      else if (titleLower.includes('ai') || titleLower.includes('machine learning') || titleLower.includes('ml')) assessedRole = 'aiml';
      else assessedRole = 'fullstack';
    }

    const job = await Job.create({
      recruiter: req.user.id,
      title,
      department: department || 'Engineering',
      location: location || 'Remote',
      type: type || 'Full-time',
      description,
      targetRole: targetRole || 'Full Stack Developer',
      requiredSkills: normalizedReq,
      preferredSkills: normalizedPref,
      minExperienceYears: minExperienceYears !== undefined ? Number(minExperienceYears) : 0,
      educationRequirement: educationRequirement || 'Bachelor\'s in Computer Science or related',
      assessmentRole: assessedRole,
      deadline: deadline || null,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Job published successfully.',
      job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update an existing job
 * @access  Private (Recruiter)
 */
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Prevent modifying other recruiters' jobs
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only update jobs created by you.'
      });
    }

    const updates = { ...req.body };
    if (updates.requiredSkills) {
      updates.requiredSkills = updates.requiredSkills.map(s => normalizeSkill(s)).filter(Boolean);
    }
    if (updates.preferredSkills) {
      updates.preferredSkills = updates.preferredSkills.map(s => normalizeSkill(s)).filter(Boolean);
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Job updated successfully.',
      job: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete or deactivate job
 * @access  Private (Recruiter)
 */
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only delete jobs created by you.'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/jobs/parse-jd
 * @desc    Analyzes pasted job description text to automatically extract skills & requirements
 * @access  Private (Recruiter)
 */
const parseJobDescription = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide job description text to parse.'
      });
    }

    // Extract recognized skills
    const extractedSkills = extractSkillsFromText(text);

    // Heuristics for years of experience
    const expRegex = /(\d+)\+?\s*(?:to\s*(\d+))?\s*(?:years?|yrs?)(?:\s*of)?\s*experience/i;
    const expMatch = text.match(expRegex);
    const minExperienceYears = expMatch ? parseInt(expMatch[1], 10) : 0;

    // Detect target role
    let detectedRole = 'Full Stack Developer';
    const textLower = text.toLowerCase();
    if (textLower.includes('frontend') || textLower.includes('front-end')) detectedRole = 'Frontend Developer';
    else if (textLower.includes('backend') || textLower.includes('back-end')) detectedRole = 'Backend Developer';
    else if (textLower.includes('java')) detectedRole = 'Java Developer';
    else if (textLower.includes('python')) detectedRole = 'Python Developer';
    else if (textLower.includes('machine learning') || textLower.includes('ai ') || textLower.includes('deep learning')) detectedRole = 'AI/ML Engineer';
    else if (textLower.includes('data analyst') || textLower.includes('analytics')) detectedRole = 'Data Analyst';

    // Partition skills into recommended required vs preferred
    const requiredSkills = extractedSkills.slice(0, Math.ceil(extractedSkills.length * 0.7));
    const preferredSkills = extractedSkills.slice(Math.ceil(extractedSkills.length * 0.7));

    res.json({
      success: true,
      extractedRequirements: {
        targetRole: detectedRole,
        minExperienceYears,
        requiredSkills,
        preferredSkills,
        allSkills: extractedSkills
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/jobs/:id/match
 * @desc    Calculate skill match & gap analysis for candidate against a job
 * @access  Private (Candidate)
 */
const matchCandidateSkills = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Get candidate's skills from latest resume or profile
    const resume = await Resume.findOne({ candidate: req.user.id }).sort({ createdAt: -1 });
    const profile = await CandidateProfile.findOne({ user: req.user.id });

    const candidateSkills = resume?.parsedData?.skills?.length
      ? resume.parsedData.skills
      : (profile?.skills || []);

    const matchResult = calculateSkillMatch(
      candidateSkills,
      job.requiredSkills,
      job.preferredSkills
    );

    res.json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        requiredSkills: job.requiredSkills,
        preferredSkills: job.preferredSkills
      },
      matchResult
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  parseJobDescription,
  matchCandidateSkills
};
