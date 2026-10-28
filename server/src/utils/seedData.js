require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const CandidateProfile = require('../models/CandidateProfile');
const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const CandidateEvaluation = require('../models/CandidateEvaluation');
const Application = require('../models/Application');
const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
const defaultAssessments = require('./defaultAssessments');
const { calculateSkillMatch } = require('../services/skillMatchingService');
const { calculateExperienceProjectScore, calculateFinalScore } = require('../services/scoringService');

async function seedDatabase() {
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: Seed script cannot be run in a production environment.');
    process.exit(1);
  }

  try {
    await connectDB();
    console.log('Clearing existing demonstration data...');

    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Resume.deleteMany({}),
      CandidateProfile.deleteMany({}),
      Assessment.deleteMany({}),
      AssessmentAttempt.deleteMany({}),
      CandidateEvaluation.deleteMany({}),
      Application.deleteMany({}),
      ApplicationStatusHistory.deleteMany({})
    ]);

    console.log('Seeding Assessments Question Banks...');
    for (const assessmentData of defaultAssessments) {
      await Assessment.create(assessmentData);
    }

    console.log('Seeding Demo Users...');

    // 1. Demo Recruiter
    const recruiter = await User.create({
      name: 'Sarah Jenkins',
      email: 'recruiter@demo.com',
      password: 'password123',
      role: 'recruiter',
      company: 'TechWave Solutions Inc.'
    });

    // 2. Demo Candidate A: Experienced Full-Stack Developer
    const candidateA = await User.create({
      name: 'Alex Rivera',
      email: 'alex@demo.com',
      password: 'password123',
      role: 'candidate',
      candidateId: 'CAND-8192'
    });

    // 3. Demo Candidate B: AI / ML Specialist
    const candidateB = await User.create({
      name: 'Jordan Chen',
      email: 'jordan@demo.com',
      password: 'password123',
      role: 'candidate',
      candidateId: 'CAND-4028'
    });

    // 4. Demo Candidate C: Junior Frontend Developer (Skill gap scenario)
    const candidateC = await User.create({
      name: 'Taylor Smith',
      email: 'taylor@demo.com',
      password: 'password123',
      role: 'candidate',
      candidateId: 'CAND-9341'
    });

    console.log('Seeding Profiles & Resumes...');

    // Profile & Resume for Candidate A
    const resumeAData = {
      name: 'Alex Rivera',
      email: 'alex@demo.com',
      phone: '+1 (555) 234-5678',
      summary: 'Senior Full Stack Engineer with 4 years of experience architecting high-performance web applications using React, Node.js, and MongoDB.',
      skills: ['React', 'Node.js', 'Express.js', 'JavaScript', 'TypeScript', 'MongoDB', 'REST APIs', 'Git', 'Docker', 'AWS'],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of Washington',
          fieldOfStudy: 'Computer Science',
          year: '2022'
        }
      ],
      experience: [
        {
          title: 'Full Stack Software Engineer',
          company: 'Nimbus Tech',
          duration: '2022 - Present',
          description: 'Engineered RESTful microservices in Node.js and Express.js with MongoDB backend. Built responsive user interfaces with React and TypeScript.',
          skillsIdentified: ['React', 'Node.js', 'Express.js', 'MongoDB', 'TypeScript', 'REST APIs']
        }
      ],
      projects: [
        {
          title: 'Cloud Analytics Dashboard',
          description: 'Developed real-time observability telemetry platform using React, Node.js, and Docker.',
          technologies: ['React', 'Node.js', 'Docker', 'MongoDB']
        }
      ],
      certifications: [
        { title: 'AWS Certified Developer Associate', issuer: 'Amazon Web Services' }
      ]
    };

    const resumeA = await Resume.create({
      candidate: candidateA._id,
      originalFilename: 'Alex_Rivera_FullStack_Resume.pdf',
      storedFilename: 'demo_alex_resume.pdf',
      filePath: 'uploads/demo_alex_resume.pdf',
      fileSize: 45000,
      mimeType: 'application/pdf',
      extractedText: JSON.stringify(resumeAData),
      parsedData: resumeAData,
      parsingStatus: 'completed'
    });

    await CandidateProfile.create({
      user: candidateA._id,
      contactDetails: { phone: '+1 (555) 234-5678', location: 'Seattle, WA' },
      summary: resumeAData.summary,
      skills: resumeAData.skills,
      education: resumeAData.education,
      experience: resumeAData.experience,
      projects: resumeAData.projects,
      certifications: resumeAData.certifications
    });

    // Profile & Resume for Candidate B (AI/ML)
    const resumeBData = {
      name: 'Jordan Chen',
      email: 'jordan@demo.com',
      phone: '+1 (555) 789-0123',
      summary: 'Machine Learning Engineer focused on Natural Language Processing, Transformer architectures, and statistical modeling with Python, PyTorch, and Scikit-learn.',
      skills: ['Python', 'Machine Learning', 'Deep Learning', 'NLP', 'PyTorch', 'TensorFlow', 'Pandas', 'NumPy', 'Scikit-learn', 'Git'],
      education: [
        {
          degree: 'Master of Science in Artificial Intelligence',
          institution: 'Carnegie Mellon University',
          fieldOfStudy: 'AI & Data Science',
          year: '2023'
        }
      ],
      experience: [
        {
          title: 'Machine Learning Researcher',
          company: 'DeepData Labs',
          duration: '2023 - Present',
          description: 'Fine-tuned Large Language Models and built end-to-end NLP data pipelines with PyTorch, Pandas, and Scikit-learn.',
          skillsIdentified: ['Python', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'NLP']
        }
      ],
      projects: [
        {
          title: 'Contextual Document Q&A Assistant',
          description: 'Implemented semantic search pipeline leveraging Transformer embeddings and Python.',
          technologies: ['Python', 'PyTorch', 'NLP', 'NumPy']
        }
      ],
      certifications: [
        { title: 'DeepLearning.AI NLP Specialization', issuer: 'Coursera' }
      ]
    };

    const resumeB = await Resume.create({
      candidate: candidateB._id,
      originalFilename: 'Jordan_Chen_AIML_Resume.pdf',
      storedFilename: 'demo_jordan_resume.pdf',
      filePath: 'uploads/demo_jordan_resume.pdf',
      fileSize: 48000,
      mimeType: 'application/pdf',
      extractedText: JSON.stringify(resumeBData),
      parsedData: resumeBData,
      parsingStatus: 'completed'
    });

    await CandidateProfile.create({
      user: candidateB._id,
      contactDetails: { phone: '+1 (555) 789-0123', location: 'San Francisco, CA' },
      summary: resumeBData.summary,
      skills: resumeBData.skills,
      education: resumeBData.education,
      experience: resumeBData.experience,
      projects: resumeBData.projects,
      certifications: resumeBData.certifications
    });

    // Profile & Resume for Candidate C (Junior Frontend)
    const resumeCData = {
      name: 'Taylor Smith',
      email: 'taylor@demo.com',
      phone: '+1 (555) 456-7890',
      summary: 'Junior Frontend Developer passionate about accessible UI design, HTML5, CSS, and React applications.',
      skills: ['JavaScript', 'HTML', 'CSS', 'React', 'Git', 'GitHub'],
      education: [
        {
          degree: 'Bachelor of Science in Information Technology',
          institution: 'State University',
          fieldOfStudy: 'IT',
          year: '2024'
        }
      ],
      experience: [
        {
          title: 'Frontend Intern',
          company: 'PixelForge Studios',
          duration: '2024 (6 months)',
          description: 'Created accessible component libraries using React and CSS for customer dashboard.',
          skillsIdentified: ['React', 'JavaScript', 'HTML', 'CSS']
        }
      ],
      projects: [
        {
          title: 'Portfolio Website & Task Tracker',
          description: 'Responsive single page application built with React and Tailwind CSS.',
          technologies: ['React', 'JavaScript', 'HTML', 'CSS']
        }
      ],
      certifications: []
    };

    const resumeC = await Resume.create({
      candidate: candidateC._id,
      originalFilename: 'Taylor_Smith_Resume.docx',
      storedFilename: 'demo_taylor_resume.docx',
      filePath: 'uploads/demo_taylor_resume.docx',
      fileSize: 32000,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extractedText: JSON.stringify(resumeCData),
      parsedData: resumeCData,
      parsingStatus: 'completed'
    });

    await CandidateProfile.create({
      user: candidateC._id,
      contactDetails: { phone: '+1 (555) 456-7890', location: 'Austin, TX' },
      summary: resumeCData.summary,
      skills: resumeCData.skills,
      education: resumeCData.education,
      experience: resumeCData.experience,
      projects: resumeCData.projects,
      certifications: resumeCData.certifications
    });

    console.log('Seeding Sample Jobs...');

    // Job 1: Full Stack Developer
    const job1 = await Job.create({
      recruiter: recruiter._id,
      title: 'Senior Full Stack Developer (React & Node.js)',
      department: 'Cloud Platform Engineering',
      location: 'Remote (US/Canada)',
      type: 'Full-time',
      description: 'We are seeking an experienced Full Stack Developer to build, maintain, and scale customer-facing web applications. You will collaborate with product designers, implement responsive frontend interfaces with React, and architect robust backend microservices with Node.js, Express.js, and MongoDB.',
      targetRole: 'Full Stack Developer',
      requiredSkills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'JavaScript'],
      preferredSkills: ['TypeScript', 'Docker', 'AWS', 'Git'],
      minExperienceYears: 2,
      educationRequirement: 'Bachelor\'s in Computer Science or related degree',
      assessmentRole: 'fullstack',
      status: 'active',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // Job 2: AI / ML Engineer
    const job2 = await Job.create({
      recruiter: recruiter._id,
      title: 'Machine Learning & NLP Research Engineer',
      department: 'Applied AI Research',
      location: 'Hybrid (San Francisco, CA)',
      type: 'Full-time',
      description: 'Join our Applied AI team to develop state-of-the-art NLP models and predictive systems. You will work on Transformer fine-tuning, high-throughput model inferencing, and feature engineering using Python, PyTorch, Pandas, and Scikit-learn.',
      targetRole: 'AI/ML Engineer',
      requiredSkills: ['Python', 'Machine Learning', 'Deep Learning', 'NLP', 'PyTorch', 'Pandas'],
      preferredSkills: ['TensorFlow', 'Scikit-learn', 'Docker', 'AWS'],
      minExperienceYears: 2,
      educationRequirement: 'Master\'s or Bachelor\'s with relevant research experience in AI/Data Science',
      assessmentRole: 'aiml',
      status: 'active',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
    });

    console.log('Seeding Applications, Assessments & Evaluations...');

    // Candidate A applied for Job 1 -> Completed Assessment -> Fully Evaluated
    const fsAssessment = await Assessment.findOne({ role: 'fullstack' });

    // Assessment Attempt for Candidate A (score 4/5 = 80%)
    const attemptA = await AssessmentAttempt.create({
      candidate: candidateA._id,
      job: job1._id,
      assessment: fsAssessment._id,
      answers: fsAssessment.questions.map((q, idx) => ({
        questionId: q._id,
        questionText: q.questionText,
        selectedOptionIndex: idx === 4 ? 0 : 1, // 4 correct out of 5
        correctOptionIndex: 1,
        isCorrect: idx !== 4,
        explanation: q.explanation
      })),
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      status: 'completed'
    });

    const matchA = calculateSkillMatch(resumeAData.skills, job1.requiredSkills, job1.preferredSkills);
    const expA = calculateExperienceProjectScore(resumeAData, job1);
    const evalA = calculateFinalScore({
      skillMatchScore: matchA.score,
      assessmentScore: 80,
      isAssessmentCompleted: true,
      experienceProjectScore: expA.score,
      skillMatchDetails: matchA
    });

    const evaluationA = await CandidateEvaluation.create({
      candidate: candidateA._id,
      job: job1._id,
      skillMatch: matchA,
      assessmentScore: {
        score: 80,
        completed: true,
        attempt: attemptA._id,
        correctCount: 4,
        totalQuestions: 5
      },
      experienceProjectScore: expA,
      finalScore: evalA.finalScore,
      scoreBreakdown: evalA.scoreBreakdown,
      evaluationStatus: evalA.evaluationStatus,
      explanation: evalA.explanation
    });

    const appA = await Application.create({
      candidate: candidateA._id,
      job: job1._id,
      resume: resumeA._id,
      status: 'Shortlisted',
      evaluation: evaluationA._id,
      recruiterNotes: 'Top candidate with strong fullstack competence and verified practical projects.'
    });

    evaluationA.application = appA._id;
    await evaluationA.save();

    await ApplicationStatusHistory.create({
      application: appA._id,
      previousStatus: 'Assessment Completed',
      newStatus: 'Shortlisted',
      changedBy: recruiter._id,
      comment: 'Shortlisted based on 80%+ evaluation score and verified skills.'
    });

    // Candidate C applied for Job 1 -> Assessment Pending (demonstrating provisional score)
    const matchC = calculateSkillMatch(resumeCData.skills, job1.requiredSkills, job1.preferredSkills);
    const expC = calculateExperienceProjectScore(resumeCData, job1);
    const evalC = calculateFinalScore({
      skillMatchScore: matchC.score,
      assessmentScore: null,
      isAssessmentCompleted: false,
      experienceProjectScore: expC.score,
      skillMatchDetails: matchC
    });

    const evaluationC = await CandidateEvaluation.create({
      candidate: candidateC._id,
      job: job1._id,
      skillMatch: matchC,
      assessmentScore: {
        score: 0,
        completed: false,
        correctCount: 0,
        totalQuestions: 5
      },
      experienceProjectScore: expC,
      finalScore: evalC.finalScore,
      scoreBreakdown: evalC.scoreBreakdown,
      evaluationStatus: evalC.evaluationStatus,
      explanation: evalC.explanation
    });

    const appC = await Application.create({
      candidate: candidateC._id,
      job: job1._id,
      resume: resumeC._id,
      status: 'Assessment Pending',
      evaluation: evaluationC._id
    });

    evaluationC.application = appC._id;
    await evaluationC.save();

    // Candidate B applied for Job 2 -> Completed Assessment -> Fully Evaluated
    const aimlAssessment = await Assessment.findOne({ role: 'aiml' });
    const attemptB = await AssessmentAttempt.create({
      candidate: candidateB._id,
      job: job2._id,
      assessment: aimlAssessment._id,
      answers: aimlAssessment.questions.map(q => ({
        questionId: q._id,
        questionText: q.questionText,
        selectedOptionIndex: 1,
        correctOptionIndex: 1,
        isCorrect: true,
        explanation: q.explanation
      })),
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      status: 'completed'
    });

    const matchB = calculateSkillMatch(resumeBData.skills, job2.requiredSkills, job2.preferredSkills);
    const expB = calculateExperienceProjectScore(resumeBData, job2);
    const evalB = calculateFinalScore({
      skillMatchScore: matchB.score,
      assessmentScore: 100,
      isAssessmentCompleted: true,
      experienceProjectScore: expB.score,
      skillMatchDetails: matchB
    });

    const evaluationB = await CandidateEvaluation.create({
      candidate: candidateB._id,
      job: job2._id,
      skillMatch: matchB,
      assessmentScore: {
        score: 100,
        completed: true,
        attempt: attemptB._id,
        correctCount: 5,
        totalQuestions: 5
      },
      experienceProjectScore: expB,
      finalScore: evalB.finalScore,
      scoreBreakdown: evalB.scoreBreakdown,
      evaluationStatus: evalB.evaluationStatus,
      explanation: evalB.explanation
    });

    const appB = await Application.create({
      candidate: candidateB._id,
      job: job2._id,
      resume: resumeB._id,
      status: 'Interview',
      evaluation: evaluationB._id,
      recruiterNotes: 'Exceptional test score in AI/ML fundamentals and strong NLP publications.'
    });

    evaluationB.application = appB._id;
    await evaluationB.save();

    console.log('========================================================');
    console.log('DEMO DATA SEEDED SUCCESSFULLY!');
    console.log('Demo Recruiter:');
    console.log('  Email: recruiter@demo.com | Password: password123');
    console.log('Demo Candidates:');
    console.log('  1. Alex Rivera   (Full Stack): alex@demo.com   | Password: password123');
    console.log('  2. Jordan Chen   (AI / ML):    jordan@demo.com | Password: password123');
    console.log('  3. Taylor Smith  (Junior UI):  taylor@demo.com | Password: password123');
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo data:', error);
    process.exit(1);
  }
}

seedDatabase();
