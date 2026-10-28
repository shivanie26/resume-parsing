const CandidateProfile = require('../models/CandidateProfile');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { generateResumeSuggestions } = require('../utils/resumeImprovementRules');

/**
 * @route   GET /api/candidates/me
 * @desc    Get current candidate profile & latest parsed resume
 * @access  Private (Candidate)
 */
const getMyProfile = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await CandidateProfile.create({ user: req.user.id });
    }

    const latestResume = await Resume.findOne({ candidate: req.user.id })
      .sort({ createdAt: -1 });

    // Auto-sync parsed resume data into profile if profile collections are empty
    if (latestResume && latestResume.parsedData) {
      const parsed = latestResume.parsedData;
      let shouldSave = false;

      if ((!profile.skills || profile.skills.length === 0) && parsed.skills?.length > 0) {
        profile.skills = parsed.skills;
        shouldSave = true;
      }
      if ((!profile.education || profile.education.length === 0) && parsed.education?.length > 0) {
        profile.education = parsed.education.map(e => ({
          degree: e.degree || '',
          institution: e.institution || '',
          fieldOfStudy: e.fieldOfStudy || '',
          year: e.year || e.endYear || '',
          endYear: e.year || e.endYear || '',
          grade: e.grade || ''
        }));
        shouldSave = true;
      }
      if ((!profile.experience || profile.experience.length === 0) && parsed.experience?.length > 0) {
        profile.experience = parsed.experience.map(e => ({
          title: e.title || '',
          company: e.company || '',
          description: e.description || '',
          technologies: e.skillsIdentified || e.technologies || []
        }));
        shouldSave = true;
      }
      if ((!profile.projects || profile.projects.length === 0) && parsed.projects?.length > 0) {
        profile.projects = parsed.projects.map(p => ({
          title: p.title || '',
          description: p.description || '',
          technologies: Array.isArray(p.technologies) ? p.technologies : [],
          link: p.link || '',
          role: p.role || ''
        }));
        shouldSave = true;
      }
      if ((!profile.certifications || profile.certifications.length === 0) && parsed.certifications?.length > 0) {
        profile.certifications = parsed.certifications.map(c => ({
          name: c.title || c.name || '',
          title: c.title || c.name || '',
          issuer: c.issuer || '',
          year: c.year || c.issueDate || '',
          issueDate: c.year || c.issueDate || ''
        }));
        shouldSave = true;
      }
      if ((!profile.languages || profile.languages.length === 0) && parsed.languages?.length > 0) {
        profile.languages = parsed.languages;
        shouldSave = true;
      }
      if (!profile.contactDetails?.phone && parsed.phone) {
        profile.contactDetails.phone = parsed.phone;
        shouldSave = true;
      }
      if (shouldSave) {
        await profile.save();
      }
    }

    res.json({
      success: true,
      profile,
      latestResume: latestResume || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/candidates/me
 * @desc    Update candidate profile details
 * @access  Private (Candidate)
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const {
      contactDetails,
      summary,
      education,
      skills,
      experience,
      projects,
      certifications,
      languages,
      achievements
    } = req.body;

    let profile = await CandidateProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user.id });
    }

    if (contactDetails) profile.contactDetails = { ...profile.contactDetails, ...contactDetails };
    if (summary !== undefined) profile.summary = summary;
    if (education) profile.education = education;
    if (skills) profile.skills = skills;
    if (experience) profile.experience = experience;
    if (projects) profile.projects = projects;
    if (certifications) profile.certifications = certifications;
    if (languages) profile.languages = languages;
    if (achievements) profile.achievements = achievements;

    await profile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/candidates/applications
 * @desc    Get all applications submitted by the candidate
 * @access  Private (Candidate)
 */
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job', 'title department location type targetRole status deadline requiredSkills')
      .populate('evaluation')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/candidates/resume-suggestions/:jobId
 * @desc    Get tailored resume improvement suggestions for a specific job
 * @access  Private (Candidate)
 */
const getResumeSuggestionsForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Get candidate's latest resume or profile
    const resume = await Resume.findOne({ candidate: req.user.id }).sort({ createdAt: -1 });
    const profile = await CandidateProfile.findOne({ user: req.user.id });

    const candidateData = resume?.parsedData || profile || {};

    const suggestions = generateResumeSuggestions(candidateData, job);

    res.json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        requiredSkills: job.requiredSkills,
        preferredSkills: job.preferredSkills
      },
      suggestions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyApplications,
  getResumeSuggestionsForJob
};
