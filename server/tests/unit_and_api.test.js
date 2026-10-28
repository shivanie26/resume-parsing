const { test, describe } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');

const { normalizeSkill, extractSkillsFromText } = require('../src/utils/skillDictionary');
const { calculateSkillMatch } = require('../src/services/skillMatchingService');
const { calculateExperienceProjectScore, calculateFinalScore } = require('../src/services/scoringService');
const { generateResumeSuggestions } = require('../src/utils/resumeImprovementRules');
const { parseResumeText } = require('../src/services/resumeParserService');

describe('1. Skill Dictionary & Normalization Tests', () => {
  test('correctly normalizes skill aliases', () => {
    assert.strictEqual(normalizeSkill('js'), 'JavaScript');
    assert.strictEqual(normalizeSkill('ReactJS'), 'React');
    assert.strictEqual(normalizeSkill('nodejs'), 'Node.js');
    assert.strictEqual(normalizeSkill('ml'), 'Machine Learning');
    assert.strictEqual(normalizeSkill('dsa'), 'Data Structures and Algorithms');
  });

  test('avoids false positive substring matches (e.g., C vs CSS, Java vs JavaScript)', () => {
    const text1 = 'Proficient in CSS styling and modern JavaScript frameworks.';
    const extracted1 = extractSkillsFromText(text1);
    assert.ok(extracted1.includes('CSS'), 'Should contain CSS');
    assert.ok(extracted1.includes('JavaScript'), 'Should contain JavaScript');
    assert.ok(!extracted1.includes('Java'), 'Should NOT match Java inside JavaScript');

    const text2 = 'Experienced with Core Java and Spring Boot backend engineering.';
    const extracted2 = extractSkillsFromText(text2);
    assert.ok(extracted2.includes('Java'), 'Should contain Java');
    assert.ok(extracted2.includes('Spring Boot'), 'Should contain Spring Boot');
  });
});

describe('2. Skill Matching Formula Tests', () => {
  test('calculates accurate percentage: (Matched / Total Required) * 100', () => {
    const candidateSkills = ['React', 'Node.js', 'JavaScript', 'Git'];
    const requiredSkills = ['React', 'Node.js', 'Express.js', 'MongoDB']; // 2 of 4 matched = 50%
    const preferredSkills = ['Docker', 'AWS'];

    const result = calculateSkillMatch(candidateSkills, requiredSkills, preferredSkills);

    assert.strictEqual(result.score, 50, 'Skill match should be exactly 50%');
    assert.strictEqual(result.matchedRequiredSkills.length, 2);
    assert.strictEqual(result.missingRequiredSkills.length, 2);
    assert.ok(result.missingRequiredSkills.includes('Express.js'));
    assert.ok(result.missingRequiredSkills.includes('MongoDB'));
  });

  test('handles zero required skills safely without NaN', () => {
    const result = calculateSkillMatch(['React'], [], []);
    assert.strictEqual(result.score, 100);
  });
});

describe('3. Experience and Scoring Engine Tests', () => {
  test('calculates final score formula correctly when assessment is completed', () => {
    // Final Score = (Skill Match * 0.40) + (Assessment * 0.40) + (Experience * 0.20)
    // 80 * 0.40 = 32
    // 90 * 0.40 = 36
    // 70 * 0.20 = 14
    // Expected = 82
    const finalResult = calculateFinalScore({
      skillMatchScore: 80,
      assessmentScore: 90,
      isAssessmentCompleted: true,
      experienceProjectScore: 70,
      skillMatchDetails: {}
    });

    assert.strictEqual(finalResult.finalScore, 82);
    assert.strictEqual(finalResult.evaluationStatus, 'fully-evaluated');
    assert.strictEqual(finalResult.scoreBreakdown.skillMatchContribution, 32);
    assert.strictEqual(finalResult.scoreBreakdown.assessmentContribution, 36);
    assert.strictEqual(finalResult.scoreBreakdown.experienceContribution, 14);
  });

  test('handles pending assessment gracefully without inflating numbers', () => {
    const finalResult = calculateFinalScore({
      skillMatchScore: 80,
      assessmentScore: null,
      isAssessmentCompleted: false,
      experienceProjectScore: 70,
      skillMatchDetails: {}
    });

    assert.strictEqual(finalResult.evaluationStatus, 'pending-assessment');
    assert.ok(finalResult.explanation.improvementAreas.some(area => area.includes('pending')));
  });
});

describe('4. Resume Improvement Suggestions Tests', () => {
  test('identifies missing skills and provides structured checklists without inventing experience', () => {
    const parsedResume = {
      skills: ['JavaScript', 'HTML', 'CSS'],
      projects: [],
      experience: []
    };
    const job = {
      title: 'Full Stack Developer',
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB']
    };

    const suggestions = generateResumeSuggestions(parsedResume, job);
    assert.ok(suggestions.keywordsToHighlight.length > 0);
    assert.ok(suggestions.projectImprovements.length > 0);
    assert.ok(suggestions.requiresCandidateConfirmation.length > 0);
  });
});

describe('5. NLP Resume Text Parsing Engine Tests', () => {
  test('extracts contact details, education, skills, and projects from resume text', () => {
    const rawResumeText = `
Alex Rivera
Email: alex.rivera@example.com
Phone: (555) 234-5678

PROFESSIONAL SUMMARY
Full Stack Engineer with extensive experience in React, Node.js, and MongoDB.

EDUCATION
Bachelor of Science in Computer Science, University of Washington, 2022

WORK EXPERIENCE
Full Stack Software Engineer
Nimbus Tech
Engineered REST APIs using Express.js and managed MongoDB databases.

PROJECTS
Cloud Analytics Dashboard: Built with React, TypeScript, and Docker.
    `;

    const parsed = parseResumeText(rawResumeText);

    assert.strictEqual(parsed.email, 'alex.rivera@example.com');
    assert.ok(parsed.phone.includes('234-5678'));
    assert.ok(parsed.skills.includes('React'));
    assert.ok(parsed.skills.includes('Node.js'));
    assert.ok(parsed.skills.includes('Express.js'));
    assert.ok(parsed.skills.includes('MongoDB'));
    assert.ok(parsed.skills.includes('TypeScript'));
    assert.ok(parsed.skills.includes('Docker'));
    assert.ok(parsed.education.length > 0);
    assert.ok(parsed.projects.length > 0);
  });
});

describe('6. Express Health and API Route Tests', () => {
  test('GET /api/health returns 200 OK', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'ok');
  });

  test('GET /api/unknown-route returns 404', async () => {
    const res = await request(app).get('/api/non-existent-endpoint');
    assert.strictEqual(res.statusCode, 404);
  });
});
