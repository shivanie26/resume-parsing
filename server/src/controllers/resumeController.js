const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const CandidateProfile = require('../models/CandidateProfile');
const User = require('../models/User');
const { extractRawTextFromFile, parseResumeText } = require('../services/resumeParserService');

/**
 * @route   POST /api/resumes/upload
 * @desc    Upload resume file and trigger initial parsing
 * @access  Private (Candidate)
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded. Please upload a PDF or DOCX file.'
      });
    }

    const { originalname, filename, path: filePath, size, mimetype } = req.file;

    // Create initial Resume record
    const resume = await Resume.create({
      candidate: req.user.id,
      originalFilename: originalname,
      storedFilename: filename,
      filePath: filePath,
      fileSize: size,
      mimeType: mimetype,
      parsingStatus: 'processing'
    });

    let rawText = '';
    let parsedData = {};
    const parsingErrors = [];

    try {
      const extraction = await extractRawTextFromFile(filePath, mimetype);
      rawText = extraction.text || '';
      const isImagePdf = extraction.isImagePdf || false;
      const meta = extraction.meta || {};

      parsedData = parseResumeText(rawText);

      // Link user identity if not detected or image PDF
      const user = await User.findById(req.user.id);
      let profile = await CandidateProfile.findOne({ user: req.user.id });

      if (!parsedData.name || parsedData.name.length < 2) {
        if (meta.title && !meta.title.toLowerCase().includes('untitled') && !meta.title.toLowerCase().includes('resume')) {
          parsedData.name = meta.title.trim();
        } else if (user && user.name) {
          parsedData.name = user.name;
        }
      }

      if (!parsedData.email) {
        if (user && user.email) {
          parsedData.email = user.email;
        }
      }

      if (!parsedData.phone) {
        if (user && user.phone) {
          parsedData.phone = user.phone;
        } else if (profile?.contactDetails?.phone) {
          parsedData.phone = profile.contactDetails.phone;
        }
      }

      // If document was an image PDF, inherit profile competencies if present
      if (isImagePdf) {
        parsedData.isImagePdf = true;
        if (profile) {
          if ((!parsedData.skills || parsedData.skills.length === 0) && profile.skills?.length > 0) {
            parsedData.skills = profile.skills;
          }
          if ((!parsedData.education || parsedData.education.length === 0) && profile.education?.length > 0) {
            parsedData.education = profile.education;
          }
          if ((!parsedData.experience || parsedData.experience.length === 0) && profile.experience?.length > 0) {
            parsedData.experience = profile.experience.map(e => ({
              title: e.title,
              company: e.company,
              description: e.description,
              skillsIdentified: e.technologies || []
            }));
          }
          if ((!parsedData.projects || parsedData.projects.length === 0) && profile.projects?.length > 0) {
            parsedData.projects = profile.projects;
          }
        }
      }

      resume.extractedText = rawText || `[Document processed: ${originalname}]`;
      resume.parsedData = parsedData;
      resume.parsingStatus = 'completed';
      resume.parsingErrors = [];
      await resume.save();

      // Sync extracted details into CandidateProfile
      if (profile) {
        if (parsedData.skills && parsedData.skills.length > 0) {
          const combined = Array.from(new Set([...(profile.skills || []), ...parsedData.skills]));
          profile.skills = combined;
        }
        if (parsedData.education && parsedData.education.length > 0) {
          profile.education = parsedData.education.map(e => ({
            degree: e.degree || '',
            institution: e.institution || '',
            fieldOfStudy: e.fieldOfStudy || '',
            year: e.year || '',
            endYear: e.year || '',
            grade: e.grade || ''
          }));
        }
        if (parsedData.experience && parsedData.experience.length > 0) {
          profile.experience = parsedData.experience.map(e => ({
            title: e.title || '',
            company: e.company || '',
            description: e.description || '',
            technologies: e.skillsIdentified || []
          }));
        }
        if (parsedData.projects && parsedData.projects.length > 0) {
          profile.projects = parsedData.projects.map(p => ({
            title: p.title || '',
            description: p.description || '',
            technologies: Array.isArray(p.technologies) ? p.technologies : [],
            link: p.link || '',
            role: p.role || ''
          }));
        }
        if (parsedData.certifications && parsedData.certifications.length > 0) {
          profile.certifications = parsedData.certifications.map(c => ({
            name: c.title || c.name || '',
            title: c.title || c.name || '',
            issuer: c.issuer || '',
            year: c.year || '',
            issueDate: c.year || c.issueDate || ''
          }));
        }
        if (parsedData.languages && parsedData.languages.length > 0) {
          profile.languages = Array.from(new Set([...(profile.languages || []), ...parsedData.languages]));
        }
        if (parsedData.phone) {
          profile.contactDetails.phone = parsedData.phone;
        }
        if (parsedData.name) {
          profile.contactDetails.name = parsedData.name;
        }
        if (parsedData.email) {
          profile.contactDetails.email = parsedData.email;
        }
        if (parsedData.summary) {
          profile.summary = parsedData.summary;
        }
        await profile.save();
      }

      const isOcr = extraction.isOcr || false;
      const warning = isOcr
        ? 'Resume processed with Optical Character Recognition (OCR) for scanned/Canva design.'
        : null;

      return res.status(201).json({
        success: true,
        message: isOcr
          ? 'Resume uploaded and parsed via Optical Character Recognition (OCR).'
          : 'Resume uploaded and parsed successfully.',
        warning,
        isOcr,
        resume
      });
    } catch (parseError) {
      parsingErrors.push(parseError.message);
      resume.parsingStatus = 'failed';
      resume.parsingErrors = parsingErrors;
      await resume.save();

      return res.status(200).json({
        success: false,
        message: `Resume uploaded, but parsing encountered an issue: ${parseError.message}`,
        resume,
        error: parseError.message
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/resumes/:id
 * @desc    Get resume by ID
 * @access  Private
 */
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    // Ensure candidate can only access their own resume, unless recruiter reviewing applicant
    if (req.user.role === 'candidate' && resume.candidate.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({
      success: true,
      resume
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/resumes/:id/parse
 * @desc    Re-run parser on an existing resume
 * @access  Private (Candidate)
 */
const reParseResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    if (resume.candidate.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const extraction = await extractRawTextFromFile(resume.filePath, resume.mimeType);
    const rawText = extraction.text || '';
    const parsedData = parseResumeText(rawText);

    resume.extractedText = rawText || resume.extractedText;
    resume.parsedData = { ...resume.parsedData, ...parsedData };
    resume.parsingStatus = 'completed';
    resume.parsingErrors = [];
    await resume.save();

    res.json({
      success: true,
      message: 'Resume re-parsed successfully.',
      resume
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/resumes/:id/parsed-data
 * @desc    Review & manually correct extracted resume details before applying
 * @access  Private (Candidate)
 */
const updateParsedData = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    if (resume.candidate.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const {
      name,
      email,
      phone,
      summary,
      skills,
      education,
      experience,
      projects,
      certifications
    } = req.body;

    // Update parsed data object
    resume.parsedData = {
      ...resume.parsedData,
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(summary !== undefined && { summary }),
      ...(skills !== undefined && { skills }),
      ...(education !== undefined && { education }),
      ...(experience !== undefined && { experience }),
      ...(projects !== undefined && { projects }),
      ...(certifications !== undefined && { certifications })
    };

    await resume.save();

    // Also sync all updated details directly into CandidateProfile
    const profileUpdate = {};
    if (skills !== undefined) profileUpdate.skills = skills;
    if (education !== undefined) {
      profileUpdate.education = education.map(e => ({
        degree: e.degree || '',
        institution: e.institution || '',
        fieldOfStudy: e.fieldOfStudy || '',
        year: e.year || '',
        endYear: e.year || '',
        grade: e.grade || ''
      }));
    }
    if (experience !== undefined) {
      profileUpdate.experience = experience.map(e => ({
        title: e.title || '',
        company: e.company || '',
        description: e.description || '',
        technologies: e.skillsIdentified || e.technologies || []
      }));
    }
    if (projects !== undefined) {
      profileUpdate.projects = projects.map(p => ({
        title: p.title || '',
        description: p.description || '',
        technologies: Array.isArray(p.technologies) ? p.technologies : []
      }));
    }
    if (certifications !== undefined) {
      profileUpdate.certifications = certifications.map(c => ({
        name: c.title || c.name || '',
        title: c.title || c.name || '',
        issuer: c.issuer || '',
        year: c.year || '',
        issueDate: c.year || c.issueDate || ''
      }));
    }
    if (summary !== undefined) profileUpdate.summary = summary;
    if (phone) profileUpdate['contactDetails.phone'] = phone;
    if (name) profileUpdate['contactDetails.name'] = name;
    if (email) profileUpdate['contactDetails.email'] = email;

    await CandidateProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileUpdate },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Extracted resume details updated and verified successfully.',
      resume
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResumeById,
  reParseResume,
  updateParsedData
};
