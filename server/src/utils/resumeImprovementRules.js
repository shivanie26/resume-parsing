/**
 * Resume Improvement Engine
 * Analyzes candidate's extracted resume against target job description and generates
 * ethical, actionable improvement suggestions without fabricating experiences.
 */

function generateResumeSuggestions(parsedResume = {}, job = {}) {
  const suggestions = {
    keywordsToHighlight: [],
    projectImprovements: [],
    experienceImprovements: [],
    recommendedCertifications: [],
    completenessChecklist: [],
    requiresCandidateConfirmation: []
  };

  const reqSkills = job.requiredSkills || [];
  const prefSkills = job.preferredSkills || [];
  const candidateSkills = (parsedResume.skills || []).map(s => s.toLowerCase());

  // 1. Missing Keywords to Highlight
  const missingReq = reqSkills.filter(s => !candidateSkills.includes(s.toLowerCase()));
  const missingPref = prefSkills.filter(s => !candidateSkills.includes(s.toLowerCase()));

  if (missingReq.length > 0) {
    suggestions.keywordsToHighlight.push({
      category: 'Critical Missing Skills',
      skills: missingReq,
      action: 'If you have worked with these technologies in coursework or personal projects, explicitly list them in your Skills section.'
    });
  }

  if (missingPref.length > 0) {
    suggestions.keywordsToHighlight.push({
      category: 'Preferred Bonus Skills',
      skills: missingPref,
      action: 'Mentioning any familiarity with these tools will increase your competitiveness against other applicants.'
    });
  }

  // 2. Project Description Improvements
  const projects = parsedResume.projects || [];
  if (projects.length === 0) {
    suggestions.projectImprovements.push({
      tip: 'Add at least 2 practical technical projects demonstrating the required tech stack.',
      example: 'e.g., "Full-Stack E-Commerce App built with React, Node.js, and MongoDB featuring JWT authentication and payment integration."'
    });
  } else {
    for (const proj of projects) {
      if (!proj.description || proj.description.length < 50) {
        suggestions.projectImprovements.push({
          project: proj.title,
          tip: 'Expand project description using the STAR/XYZ method (Accomplished [X] as measured by [Y], by doing [Z]).',
          example: 'Instead of "Built a web app", use: "Developed a responsive web app using React and Node.js that optimized API response time by 30%."'
        });
      }
      if (!proj.technologies || proj.technologies.length === 0) {
        suggestions.projectImprovements.push({
          project: proj.title,
          tip: 'Explicitly list the libraries, databases, and frameworks used in this project.'
        });
      }
    }
  }

  // 3. Experience Improvements
  const experience = parsedResume.experience || [];
  if (experience.length > 0) {
    for (const exp of experience) {
      if (!exp.description || exp.description.length < 80) {
        suggestions.experienceImprovements.push({
          role: exp.title || 'Role',
          tip: 'Quantify your impact with measurable metrics (e.g., percentages, user counts, latency reductions, or bug fixes).'
        });
      }
      const descLower = (exp.description || '').toLowerCase();
      const hasActionVerbs = /(architected|developed|engineered|implemented|optimized|designed|delivered|spearheaded|refactored)/i.test(descLower);
      if (!hasActionVerbs) {
        suggestions.experienceImprovements.push({
          role: exp.title || 'Role',
          tip: 'Begin bullet points with strong action verbs (e.g., Architected, Engineered, Optimized, Spearheaded).'
        });
      }
    }
  } else {
    suggestions.experienceImprovements.push({
      tip: 'No formal employment listed. Highlight relevant internships, open-source contributions, or technical student societies.'
    });
  }

  // 4. Relevant Certification Recommendations
  const targetRole = (job.targetRole || job.title || '').toLowerCase();
  if (targetRole.includes('full stack') || targetRole.includes('web')) {
    suggestions.recommendedCertifications.push({
      name: 'Meta Front-End / Back-End Professional Certificate',
      focus: 'React, Node.js, REST APIs'
    });
    suggestions.recommendedCertifications.push({
      name: 'AWS Certified Cloud Practitioner or Developer Associate',
      focus: 'Cloud architecture and deployment'
    });
  } else if (targetRole.includes('java')) {
    suggestions.recommendedCertifications.push({
      name: 'Oracle Certified Professional: Java SE Programmer',
      focus: 'Enterprise Java, OOP, Multithreading'
    });
    suggestions.recommendedCertifications.push({
      name: 'Spring Certified Professional',
      focus: 'Spring Boot, Spring Security, Microservices'
    });
  } else if (targetRole.includes('ai') || targetRole.includes('machine learning') || targetRole.includes('data')) {
    suggestions.recommendedCertifications.push({
      name: 'DeepLearning.AI Machine Learning Specialization',
      focus: 'Supervised Learning, Neural Networks, PyTorch'
    });
    suggestions.recommendedCertifications.push({
      name: 'TensorFlow Developer Certificate',
      focus: 'Deep Learning, NLP, Computer Vision'
    });
  }

  // 5. Completeness Checklist
  suggestions.completenessChecklist = [
    { item: 'Contact Information (Email & Phone)', complete: Boolean(parsedResume.email && parsedResume.phone) },
    { item: 'Professional Summary', complete: Boolean(parsedResume.summary && parsedResume.summary.length > 20) },
    { item: 'Skills List (At least 5 verified skills)', complete: Boolean(parsedResume.skills && parsedResume.skills.length >= 5) },
    { item: 'Education Details with Degree and Year', complete: Boolean(parsedResume.education && parsedResume.education.length > 0) },
    { item: 'Projects with Detailed Descriptions', complete: Boolean(parsedResume.projects && parsedResume.projects.length >= 2) },
    { item: 'Work Experience or Internships', complete: Boolean(parsedResume.experience && parsedResume.experience.length > 0) },
    { item: 'Certifications & Accreditations', complete: Boolean(parsedResume.certifications && parsedResume.certifications.length > 0) }
  ];

  // 6. Explicitly labelled confirmation notice
  suggestions.requiresCandidateConfirmation = [
    'Always verify that all added skills and technologies reflect genuine, demonstrable knowledge.',
    'Never invent projects or experience to match job descriptions, as technical assessments and interviews will evaluate these directly.',
    'Ensure all dates and educational institutions match verifiable transcripts and certificates.'
  ];

  return suggestions;
}

module.exports = {
  generateResumeSuggestions
};
