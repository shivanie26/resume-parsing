const { normalizeSkill } = require('../utils/skillDictionary');

/**
 * Calculates skill matching and detailed skill gap analysis between candidate skills and job requirements
 * @param {string[]} candidateSkills - List of extracted or confirmed candidate skills
 * @param {string[]} requiredSkills - Job mandatory skills
 * @param {string[]} preferredSkills - Job preferred/optional skills
 * @returns {object} Match metrics and gap analysis
 */
function calculateSkillMatch(candidateSkills = [], requiredSkills = [], preferredSkills = []) {
  // Normalize candidate skills
  const normalizedCandidate = Array.from(
    new Set((candidateSkills || []).map(s => normalizeSkill(s)).filter(Boolean))
  );

  // Normalize required skills
  const normalizedRequired = Array.from(
    new Set((requiredSkills || []).map(s => normalizeSkill(s)).filter(Boolean))
  );

  // Normalize preferred skills
  const normalizedPreferred = Array.from(
    new Set((preferredSkills || []).map(s => normalizeSkill(s)).filter(Boolean))
  );

  // Set for fast lookup (case-insensitive)
  const candidateLowerSet = new Set(normalizedCandidate.map(s => s.toLowerCase()));

  // 1. Calculate Matched & Missing Required Skills
  const matchedRequiredSkills = [];
  const missingRequiredSkills = [];

  for (const reqSkill of normalizedRequired) {
    if (candidateLowerSet.has(reqSkill.toLowerCase())) {
      matchedRequiredSkills.push(reqSkill);
    } else {
      missingRequiredSkills.push(reqSkill);
    }
  }

  // 2. Calculate Matched & Missing Preferred Skills
  const matchedPreferredSkills = [];
  const missingPreferredSkills = [];

  for (const prefSkill of normalizedPreferred) {
    if (candidateLowerSet.has(prefSkill.toLowerCase())) {
      matchedPreferredSkills.push(prefSkill);
    } else {
      missingPreferredSkills.push(prefSkill);
    }
  }

  // 3. Additional Candidate Skills (not required or preferred)
  const allJobSkillsLower = new Set([
    ...normalizedRequired.map(s => s.toLowerCase()),
    ...normalizedPreferred.map(s => s.toLowerCase())
  ]);

  const additionalSkills = normalizedCandidate.filter(
    s => !allJobSkillsLower.has(s.toLowerCase())
  );

  // 4. Calculate Skill Match Percentage
  // Formula: Skill Match Percentage = (Matched Required Skills / Total Required Skills) * 100
  let score = 0;
  if (normalizedRequired.length > 0) {
    score = Math.round((matchedRequiredSkills.length / normalizedRequired.length) * 100);
  } else {
    // If no required skills are defined, handle safely
    score = 100;
  }

  // Cap score between 0 and 100
  score = Math.min(100, Math.max(0, score));

  // 5. Skill Gap Priority Recommendations
  const gapAnalysis = {
    mandatoryGaps: missingRequiredSkills.map(skill => ({
      skill,
      priority: 'High - Mandatory Requirement',
      impact: 'Blocks shortlisting or lowers core competency score',
      recommendation: `Add verifiable experience, projects, or certification in ${skill} to meet minimum requirements.`
    })),
    preferredGaps: missingPreferredSkills.map(skill => ({
      skill,
      priority: 'Medium - Preferred / Good-to-have',
      impact: 'Competitive differentiator among top applicants',
      recommendation: `Familiarity with ${skill} will strengthen your profile against competing candidates.`
    })),
    suggestedLearningPath: [
      ...missingRequiredSkills.map(s => `Master ${s} (Core Job Requirement)`),
      ...missingPreferredSkills.map(s => `Learn ${s} (Bonus Competency)`)
    ]
  };

  return {
    score,
    matchedRequiredSkills,
    missingRequiredSkills,
    matchedPreferredSkills,
    missingPreferredSkills,
    additionalSkills,
    totalRequiredSkills: normalizedRequired.length,
    totalMatchedSkills: matchedRequiredSkills.length,
    gapAnalysis
  };
}

module.exports = {
  calculateSkillMatch
};
