/**
 * Scoring Service
 * Handles transparent, explainable rule-based evaluation of Experience/Projects,
 * and calculates Final Candidate Scores according to the Master Prompt specification.
 */

/**
 * Calculates a transparent Experience & Project Score (0-100) based on verified job-related evidence
 * @param {object} candidateProfileOrResumeData 
 * @param {object} job 
 * @returns {object} { score, breakdown, details }
 */
function calculateExperienceProjectScore(candidateData = {}, job = {}) {
  const experiences = candidateData.experience || [];
  const projects = candidateData.projects || [];
  const education = candidateData.education || [];
  const requiredSkills = (job.requiredSkills || []).map(s => s.toLowerCase());

  let experienceScore = 0; // Max 40 points
  let projectScore = 0;    // Max 30 points
  let skillEvidenceScore = 0; // Max 20 points
  let educationScore = 0;  // Max 10 points
  const details = [];

  // 1. Experience Evaluation (up to 40 pts)
  // Each documented role grants points based on relevance
  if (experiences.length > 0) {
    const minReqYears = job.minExperienceYears || 0;
    // Base points for documented professional experience
    const baseExpPoints = Math.min(30, experiences.length * 15);
    experienceScore += baseExpPoints;
    details.push(`Documented ${experiences.length} work experience role(s) (+${baseExpPoints} pts).`);

    // Check if roles have descriptions and relevance
    let relevantRoleCount = 0;
    for (const exp of experiences) {
      const desc = ((exp.title || '') + ' ' + (exp.description || '')).toLowerCase();
      const hasJobSkill = requiredSkills.some(skill => desc.includes(skill));
      if (hasJobSkill) relevantRoleCount++;
    }

    if (relevantRoleCount > 0) {
      const relevanceBonus = Math.min(10, relevantRoleCount * 5);
      experienceScore += relevanceBonus;
      details.push(`${relevantRoleCount} role(s) show direct alignment with job required technologies (+${relevanceBonus} pts).`);
    }
  } else {
    details.push('No formal industry work experience listed (0 pts). Fresher/Entry-level profile.');
  }

  // 2. Project Evaluation (up to 30 pts)
  // Projects demonstrate hands-on practical application of competencies
  if (projects.length > 0) {
    const baseProjPoints = Math.min(20, projects.length * 10);
    projectScore += baseProjPoints;
    details.push(`Demonstrated ${projects.length} practical technical project(s) (+${baseProjPoints} pts).`);

    // Check if project technologies match job requirements
    let techMatchedProjects = 0;
    for (const proj of projects) {
      const projTech = (proj.technologies || []).map(t => t.toLowerCase());
      const projDesc = (proj.description || '').toLowerCase();
      const hasMatch = requiredSkills.some(skill => projTech.includes(skill) || projDesc.includes(skill));
      if (hasMatch) techMatchedProjects++;
    }

    if (techMatchedProjects > 0) {
      const projBonus = Math.min(10, techMatchedProjects * 5);
      projectScore += projBonus;
      details.push(`${techMatchedProjects} project(s) incorporate mandatory job stack skills (+${projBonus} pts).`);
    }
  } else {
    details.push('No technical projects listed (0 pts).');
  }

  // 3. Evidence of Skills in Projects & Work (up to 20 pts)
  const allTechUsed = new Set();
  projects.forEach(p => (p.technologies || []).forEach(t => allTechUsed.add(t.toLowerCase())));
  experiences.forEach(e => (e.skillsIdentified || []).forEach(t => allTechUsed.add(t.toLowerCase())));

  let verifiedSkillsCount = 0;
  for (const skill of requiredSkills) {
    if (allTechUsed.has(skill)) verifiedSkillsCount++;
  }

  if (requiredSkills.length > 0) {
    const evidenceRatio = verifiedSkillsCount / requiredSkills.length;
    skillEvidenceScore = Math.round(evidenceRatio * 20);
    details.push(`Project/Work evidence verified for ${verifiedSkillsCount}/${requiredSkills.length} required skill(s) (+${skillEvidenceScore} pts).`);
  }

  // 4. Education Alignment (up to 10 pts)
  if (education.length > 0) {
    educationScore = 10;
    details.push(`Verified academic degree credentials (${education[0].degree || 'Technical Degree'}) (+10 pts).`);
  } else {
    details.push('No verified degree information extracted (0 pts).');
  }

  const totalScore = Math.min(100, experienceScore + projectScore + skillEvidenceScore + educationScore);

  return {
    score: totalScore,
    breakdown: {
      experienceScore,
      projectScore,
      skillEvidenceScore,
      educationScore
    },
    details
  };
}

/**
 * Calculates Final Candidate Score according to:
 * Final Score = (Skill Match * 0.40) + (Assessment Percentage * 0.40) + (Experience/Project Score * 0.20)
 * Handles pending assessments honestly without fabricating numbers.
 * 
 * @param {object} params
 * @param {number} params.skillMatchScore - 0 to 100
 * @param {number|null} params.assessmentScore - 0 to 100 or null if pending
 * @param {boolean} params.isAssessmentCompleted - boolean
 * @param {number} params.experienceProjectScore - 0 to 100
 * @param {object} params.skillMatchDetails - detailed matched/missing skills
 * @returns {object} Final score, evaluation status, and explanation
 */
function calculateFinalScore({
  skillMatchScore = 0,
  assessmentScore = null,
  isAssessmentCompleted = false,
  experienceProjectScore = 0,
  skillMatchDetails = {}
}) {
  const normSkill = Math.min(100, Math.max(0, Number(skillMatchScore) || 0));
  const normExp = Math.min(100, Math.max(0, Number(experienceProjectScore) || 0));

  let finalScore = 0;
  let evaluationStatus = 'pending-assessment';
  let normAssessment = 0;

  const skillMatchContribution = parseFloat((normSkill * 0.40).toFixed(2));
  const experienceContribution = parseFloat((normExp * 0.20).toFixed(2));
  let assessmentContribution = 0;

  if (isAssessmentCompleted && assessmentScore !== null && assessmentScore !== undefined) {
    normAssessment = Math.min(100, Math.max(0, Number(assessmentScore) || 0));
    assessmentContribution = parseFloat((normAssessment * 0.40).toFixed(2));
    finalScore = parseFloat((skillMatchContribution + assessmentContribution + experienceContribution).toFixed(2));
    evaluationStatus = 'fully-evaluated';
  } else {
    // When assessment is pending, compute provisional score based only on resume parts (normalized)
    // Resume is 60% of total (40% skills + 20% exp). Provisional scale = (skill*0.4 + exp*0.2) / 0.6
    finalScore = parseFloat(((skillMatchContribution + experienceContribution) / 0.6).toFixed(2));
    evaluationStatus = 'pending-assessment';
  }

  // Generate transparent strengths and skill gaps explanation
  const strengths = [];
  const skillGaps = [];
  const improvementAreas = [];

  if (normSkill >= 75) {
    strengths.push(`Strong core skill alignment: matches ${normSkill}% of required job competencies.`);
  }
  if (normExp >= 70) {
    strengths.push(`Solid practical background: verified hands-on project and experience credentials.`);
  }
  if (isAssessmentCompleted && normAssessment >= 75) {
    strengths.push(`High technical competency: scored ${normAssessment}% on the role-specific assessment.`);
  }

  if (skillMatchDetails.missingRequiredSkills && skillMatchDetails.missingRequiredSkills.length > 0) {
    skillGaps.push(`Missing mandatory requirements: ${skillMatchDetails.missingRequiredSkills.join(', ')}.`);
  }

  if (isAssessmentCompleted && normAssessment < 60) {
    improvementAreas.push(`Assessment score (${normAssessment}%) is below recommended proficiency benchmark (60%).`);
  }

  if (!isAssessmentCompleted) {
    improvementAreas.push('Competency assessment is pending. Candidate must complete MCQ evaluation for finalized ranking.');
  }

  const summary = evaluationStatus === 'fully-evaluated'
    ? `Fully evaluated candidate with an overall score of ${finalScore}/100. Contributed by Skills (${skillMatchContribution}/40), Assessment (${assessmentContribution}/40), and Experience/Projects (${experienceContribution}/20).`
    : `Provisional evaluation score of ${finalScore}/100 (Assessment Pending). Final ranking will be assigned upon completion of technical assessment.`;

  return {
    finalScore,
    scoreBreakdown: {
      skillMatchContribution,
      assessmentContribution,
      experienceContribution
    },
    evaluationStatus,
    explanation: {
      strengths,
      skillGaps,
      improvementAreas,
      summary
    }
  };
}

module.exports = {
  calculateExperienceProjectScore,
  calculateFinalScore
};
