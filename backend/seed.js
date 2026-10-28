const bcrypt = require('bcryptjs');
const { initDb, dbStorage } = require('./config/dbStorage');

const seedDatabase = async () => {
  await initDb();

  console.log('🌱 Starting database seed script...');

  // Clear existing collections
  await dbStorage.clearCollection('users');
  await dbStorage.clearCollection('jobs');
  await dbStorage.clearCollection('resumes');
  await dbStorage.clearCollection('assessments');

  // 1. Create Recruiter User
  const recruiterPasswordHash = await bcrypt.hash('password123', 10);
  const recruiter = await dbStorage.insert('users', {
    _id: 'recruiter_demo_1',
    name: 'Sarah Jenkins',
    email: 'recruiter@platform.com',
    passwordHash: recruiterPasswordHash,
    role: 'recruiter'
  });

  // 2. Create Candidate Users
  const candidatePasswordHash = await bcrypt.hash('password123', 10);
  const cand1 = await dbStorage.insert('users', {
    _id: 'cand_alex_101',
    name: 'Alex Rivera',
    email: 'alex.rivera@email.com',
    passwordHash: candidatePasswordHash,
    role: 'candidate'
  });

  const cand2 = await dbStorage.insert('users', {
    _id: 'cand_priya_102',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    passwordHash: candidatePasswordHash,
    role: 'candidate'
  });

  const cand3 = await dbStorage.insert('users', {
    _id: 'cand_marcus_103',
    name: 'Marcus Vance',
    email: 'marcus.vance@email.com',
    passwordHash: candidatePasswordHash,
    role: 'candidate'
  });

  const cand4 = await dbStorage.insert('users', {
    _id: 'cand_elena_104',
    name: 'Elena Rostova',
    email: 'elena.rostova@email.com',
    passwordHash: candidatePasswordHash,
    role: 'candidate'
  });

  // 3. Create Sample Job Postings
  const job1 = await dbStorage.insert('jobs', {
    _id: 'job_fullstack_201',
    recruiterId: recruiter._id,
    title: 'Senior Full Stack Engineer (React + Node.js)',
    description: 'We are seeking a high-performing Senior Full Stack Developer to build scalable cloud-native web applications. The candidate will design REST APIs, build modern React user interfaces, integrate MongoDB databases, and implement CI/CD deployment pipelines.',
    requiredSkills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'SQL', 'REST API', 'Git'],
    preferredSkills: ['Docker', 'AWS', 'GraphQL', 'MongoDB', 'Tailwind CSS'],
    experienceRequirement: 3,
    educationRequirement: "Bachelor's Degree in Computer Science or Software Engineering",
    competencyWeights: {
      technicalSkills: 40,
      relevantExperience: 25,
      projects: 15,
      education: 10,
      certifications: 10
    }
  });

  const job2 = await dbStorage.insert('jobs', {
    _id: 'job_ml_202',
    recruiterId: recruiter._id,
    title: 'Lead Machine Learning & AI Architect',
    description: 'Looking for a Lead ML Engineer to design predictive NLP models, computer vision pipelines, and deep learning architectures. Candidates should possess strong expertise in Python, PyTorch/TensorFlow, SQL, feature engineering, and model deployment.',
    requiredSkills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'SQL', 'Data Science'],
    preferredSkills: ['AWS', 'Docker', 'Kubernetes', 'Natural Language Processing', 'MLOps'],
    experienceRequirement: 4,
    educationRequirement: "Master's or Bachelor's Degree in Computer Science / AI / Data Science",
    competencyWeights: {
      technicalSkills: 45,
      relevantExperience: 25,
      projects: 15,
      education: 10,
      certifications: 5
    }
  });

  // 4. Create Sample Parsed Resumes
  const resume1 = await dbStorage.insert('resumes', {
    _id: 'res_alex_301',
    candidateId: cand1._id,
    fileName: 'Alex_Rivera_FullStack_Resume.pdf',
    filePath: 'sample_resumes/Alex_Rivera_FullStack_Resume.pdf',
    extractedText: `Alex Rivera
Email: alex.rivera@email.com | Phone: (555) 234-5678
OBJECTIVE: Senior Full Stack Engineer with 4.5 years of experience building modern web platforms with React, Node.js, Express, TypeScript, and AWS.

TECHNICAL SKILLS:
- Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3
- Frameworks & Libraries: React, React Native, Node.js, Express.js, Redux, Tailwind CSS
- Databases & Cloud: MongoDB, PostgreSQL, AWS (S3, EC2, Lambda), Docker, Git

WORK EXPERIENCE:
Senior Software Engineer | Apex Tech Solutions (2022 - Present)
- Engineered scalable microservices backend using Node.js and Express handling 200k daily REST API requests.
- Developed real-time dashboard analytics portal in React and TypeScript.
- Integrated PostgreSQL and Redis caching layers.

Full Stack Developer | Cloudify Systems (2020 - 2022)
- Built interactive customer portals using React, HTML5, and CSS3.
- Automated Docker container deployments on AWS EC2.

PROJECTS:
1. Microservice E-Commerce Engine: Architected Node.js microservices with GraphQL and React frontend.
2. Real-Time Telemetry Dashboard: Built React/TypeScript web app with WebSockets and Tailwind CSS.

EDUCATION:
B.S. in Computer Science | University of California, Berkeley (2020)

CERTIFICATIONS:
- AWS Certified Solutions Architect - Associate
- Meta Certified Senior Front-End Developer`,
    parsedData: {
      name: 'Alex Rivera',
      email: 'alex.rivera@email.com',
      phone: '(555) 234-5678',
      education: [{ degree: 'B.S. in Computer Science', institution: 'University of California, Berkeley', year: '2020' }],
      skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'SQL', 'REST API', 'Git', 'MongoDB', 'Docker', 'AWS', 'Tailwind CSS', 'HTML', 'CSS', 'Python'],
      programming_languages: ['JAVASCRIPT', 'TYPESCRIPT', 'PYTHON', 'SQL', 'HTML', 'CSS'],
      tools: ['GIT', 'DOCKER', 'AWS', 'MONGODB'],
      certifications: ['AWS Certified Solutions Architect - Associate', 'Meta Certified Senior Front-End Developer'],
      projects: [
        { title: 'Microservice E-Commerce Engine', description: 'Architected Node.js microservices with GraphQL and React frontend.', technologies: ['Node.js', 'React', 'GraphQL'] },
        { title: 'Real-Time Telemetry Dashboard', description: 'Built React/TypeScript web app with WebSockets and Tailwind CSS.', technologies: ['React', 'TypeScript', 'Tailwind CSS'] }
      ],
      experience: [
        { company: 'Apex Tech Solutions', role: 'Senior Software Engineer', duration: '2.5 years', description: 'Engineered scalable microservices backend using Node.js and Express', years: 2.5 },
        { company: 'Cloudify Systems', role: 'Full Stack Developer', duration: '2 years', description: 'Built interactive customer portals using React', years: 2.0 }
      ],
      total_experience: 4.5
    }
  });

  const resume2 = await dbStorage.insert('resumes', {
    _id: 'res_priya_302',
    candidateId: cand2._id,
    fileName: 'Priya_Sharma_AI_ML_Resume.docx',
    filePath: 'sample_resumes/Priya_Sharma_AI_ML_Resume.docx',
    extractedText: `Priya Sharma
Email: priya.sharma@email.com | Phone: (555) 876-5432
Lead Machine Learning Scientist with 5 years of experience in Deep Learning, NLP, Computer Vision, and Predictive Analytics.

SKILLS & COMPETENCIES:
Python, PyTorch, TensorFlow, Machine Learning, Deep Learning, SQL, Data Science, Natural Language Processing, MLOps, AWS, Docker, Kubernetes, Pandas, NumPy, Scikit-learn

EXPERIENCE:
Staff AI Specialist | Neural AI Labs (2021 - Present)
- Designed transformer-based NLP resume parsing and document intelligence models using PyTorch and HuggingFace.
- Deployed ML inference API on AWS SageMaker and Kubernetes clusters.

Data Scientist | Analytics Corp (2019 - 2021)
- Built computer vision defect detection models using TensorFlow and Python.

PROJECTS:
1. Transformer NLP Document Intelligence: Built state-of-the-art NLP entity extractor in PyTorch.
2. MLOps Automated Pipeline: Continuous model monitoring framework using Docker and Kubernetes on AWS.

EDUCATION:
M.S. in Artificial Intelligence & Data Science | Carnegie Mellon University (2019)
B.E. in Computer Engineering | IIT Bombay (2017)

CERTIFICATIONS:
- AWS Certified Machine Learning - Specialty
- DeepLearning.AI Deep Learning Specialization`,
    parsedData: {
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '(555) 876-5432',
      education: [
        { degree: 'M.S. in Artificial Intelligence & Data Science', institution: 'Carnegie Mellon University', year: '2019' },
        { degree: 'B.E. in Computer Engineering', institution: 'IIT Bombay', year: '2017' }
      ],
      skills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'SQL', 'Data Science', 'AWS', 'Docker', 'Kubernetes', 'Natural Language Processing', 'MLOps', 'Git'],
      programming_languages: ['PYTHON', 'SQL'],
      tools: ['AWS', 'DOCKER', 'KUBERNETES', 'GIT'],
      certifications: ['AWS Certified Machine Learning - Specialty', 'DeepLearning.AI Deep Learning Specialization'],
      projects: [
        { title: 'Transformer NLP Document Intelligence', description: 'Built state-of-the-art NLP entity extractor in PyTorch.', technologies: ['Python', 'PyTorch', 'NLP'] },
        { title: 'MLOps Automated Pipeline', description: 'Continuous model monitoring framework using Docker and Kubernetes on AWS.', technologies: ['Docker', 'Kubernetes', 'AWS'] }
      ],
      experience: [
        { company: 'Neural AI Labs', role: 'Staff AI Specialist', duration: '3 years', description: 'Designed transformer-based NLP resume parsing models', years: 3.0 },
        { company: 'Analytics Corp', role: 'Data Scientist', duration: '2 years', description: 'Built computer vision models using TensorFlow', years: 2.0 }
      ],
      total_experience: 5.0
    }
  });

  const resume3 = await dbStorage.insert('resumes', {
    _id: 'res_marcus_303',
    candidateId: cand3._id,
    fileName: 'Marcus_Vance_Software_Dev_Resume.pdf',
    filePath: 'sample_resumes/Marcus_Vance_Software_Dev_Resume.pdf',
    extractedText: `Marcus Vance
Email: marcus.vance@email.com | Phone: (555) 432-1098
Full Stack Developer with 2.5 years of experience in JavaScript, React, HTML, CSS, REST APIs, and Node.js.

SKILLS:
JavaScript, React, Node.js, Express, HTML, CSS, Git, REST API, MongoDB

EXPERIENCE:
Junior Web Developer | Digital Innovations (2022 - Present)
- Developed responsive web interfaces using React and CSS.
- Created RESTful microservice routes with Node.js.

PROJECTS:
1. Inventory Management App: Node.js and MongoDB Web Application.

EDUCATION:
B.S. in Information Technology | University of Illinois (2022)

CERTIFICATIONS:
- FreeCodeCamp Full Stack Developer Certification`,
    parsedData: {
      name: 'Marcus Vance',
      email: 'marcus.vance@email.com',
      phone: '(555) 432-1098',
      education: [{ degree: 'B.S. in Information Technology', institution: 'University of Illinois', year: '2022' }],
      skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'Git', 'REST API', 'MongoDB'],
      programming_languages: ['JAVASCRIPT', 'HTML', 'CSS'],
      tools: ['GIT', 'MONGODB'],
      certifications: ['FreeCodeCamp Full Stack Developer Certification'],
      projects: [
        { title: 'Inventory Management App', description: 'Node.js and MongoDB Web Application.', technologies: ['Node.js', 'MongoDB', 'React'] }
      ],
      experience: [
        { company: 'Digital Innovations', role: 'Junior Web Developer', duration: '2.5 years', description: 'Developed responsive web interfaces using React', years: 2.5 }
      ],
      total_experience: 2.5
    }
  });

  const resume4 = await dbStorage.insert('resumes', {
    _id: 'res_elena_304',
    candidateId: cand4._id,
    fileName: 'Elena_Rostova_FullStack_ML_Resume.pdf',
    filePath: 'sample_resumes/Elena_Rostova_FullStack_ML_Resume.pdf',
    extractedText: `Elena Rostova
Email: elena.rostova@email.com | Phone: (555) 901-2345
Versatile Software Engineer & ML Practitioner with 4 years of experience combining React, Node.js, Python, TensorFlow, and AWS.

SKILLS:
React, Node.js, Python, TypeScript, Machine Learning, TensorFlow, SQL, AWS, Docker, REST API, Git, GraphQL

EXPERIENCE:
Software & AI Engineer | Synapse Innovations (2020 - Present)
- Developed AI-powered web applications using React, Python, Node.js, and AWS.

EDUCATION:
B.Tech in Computer Science & Engineering | MIT (2020)

PROJECTS:
1. Intelligent Smart Search Engine: Built semantic search tool using Python and React.

CERTIFICATIONS:
- Certified AWS Developer`,
    parsedData: {
      name: 'Elena Rostova',
      email: 'elena.rostova@email.com',
      phone: '(555) 901-2345',
      education: [{ degree: 'B.Tech in Computer Science & Engineering', institution: 'MIT', year: '2020' }],
      skills: ['React', 'Node.js', 'Python', 'TypeScript', 'Machine Learning', 'TensorFlow', 'SQL', 'AWS', 'Docker', 'REST API', 'Git', 'GraphQL'],
      programming_languages: ['PYTHON', 'TYPESCRIPT', 'SQL'],
      tools: ['AWS', 'DOCKER', 'GIT'],
      certifications: ['Certified AWS Developer'],
      projects: [
        { title: 'Intelligent Smart Search Engine', description: 'Built semantic search tool using Python and React.', technologies: ['Python', 'React', 'NLP'] }
      ],
      experience: [
        { company: 'Synapse Innovations', role: 'Software & AI Engineer', duration: '4 years', description: 'Developed AI-powered web applications', years: 4.0 }
      ],
      total_experience: 4.0
    }
  });

  // 5. Pre-calculate Assessment evaluations for immediate turn-key demonstration
  const { calculateAssessment } = require('./services/scoringEngine');

  const assess1 = calculateAssessment(resume1.parsedData, job1, resume1.extractedText);
  await dbStorage.insert('assessments', {
    candidateId: cand1._id,
    jobId: job1._id,
    candidateName: cand1.name,
    candidateEmail: cand1.email,
    ...assess1
  });

  const assess2 = calculateAssessment(resume3.parsedData, job1, resume3.extractedText);
  await dbStorage.insert('assessments', {
    candidateId: cand3._id,
    jobId: job1._id,
    candidateName: cand3.name,
    candidateEmail: cand3.email,
    ...assess2
  });

  const assess3 = calculateAssessment(resume4.parsedData, job1, resume4.extractedText);
  await dbStorage.insert('assessments', {
    candidateId: cand4._id,
    jobId: job1._id,
    candidateName: cand4.name,
    candidateEmail: cand4.email,
    ...assess3
  });

  const assessML1 = calculateAssessment(resume2.parsedData, job2, resume2.extractedText);
  await dbStorage.insert('assessments', {
    candidateId: cand2._id,
    jobId: job2._id,
    candidateName: cand2.name,
    candidateEmail: cand2.email,
    ...assessML1
  });

  const assessML2 = calculateAssessment(resume4.parsedData, job2, resume4.extractedText);
  await dbStorage.insert('assessments', {
    candidateId: cand4._id,
    jobId: job2._id,
    candidateName: cand4.name,
    candidateEmail: cand4.email,
    ...assessML2
  });

  console.log('✅ Database successfully seeded with demo Recruiter, Candidates, Jobs, Resumes & Assessments!');
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
