/**
 * Comprehensive Skill Dictionary & Aliases Normalizer
 * Provides accurate regex patterns to avoid false-positive substring matches (e.g., 'C' vs 'CSS' or 'Java' vs 'JavaScript')
 */

const SKILL_DEFINITIONS = [
  // Programming Languages
  {
    name: 'JavaScript',
    category: 'Languages',
    aliases: ['javascript', 'js', 'es6', 'ecmascript'],
    pattern: /\b(javascript|js|es6|ecmascript)\b/i
  },
  {
    name: 'TypeScript',
    category: 'Languages',
    aliases: ['typescript', 'ts'],
    pattern: /\b(typescript|ts)\b/i
  },
  {
    name: 'Python',
    category: 'Languages',
    aliases: ['python', 'py'],
    pattern: /\bpython(3)?\b/i
  },
  {
    name: 'Java',
    category: 'Languages',
    aliases: ['java', 'core java'],
    // Ensure Java does not match JavaScript
    pattern: /\bjava\b(?!\s*script)/i
  },
  {
    name: 'C++',
    category: 'Languages',
    aliases: ['c++', 'cpp'],
    pattern: /(\bc\+\+|\bcpp\b)/i
  },
  {
    name: 'C',
    category: 'Languages',
    aliases: ['c language', 'c programming'],
    // Match C only when accompanied by language/programming or preceded by ANSI / embedded
    pattern: /\b(c\s+(language|programming)|ansi\s+c|embedded\s+c)\b/i
  },
  {
    name: 'HTML',
    category: 'Frontend',
    aliases: ['html', 'html5'],
    pattern: /\bhtml(5)?\b/i
  },
  {
    name: 'CSS',
    category: 'Frontend',
    aliases: ['css', 'css3', 'tailwind', 'bootstrap'],
    pattern: /\b(css(3)?|tailwind(\s*css)?|bootstrap)\b/i
  },

  // Frontend Frameworks
  {
    name: 'React',
    category: 'Frontend',
    aliases: ['react', 'react.js', 'reactjs'],
    pattern: /\b(react|react\.js|reactjs)\b/i
  },

  // Backend & APIs
  {
    name: 'Node.js',
    category: 'Backend',
    aliases: ['node.js', 'nodejs', 'node'],
    pattern: /\b(node\.js|nodejs|node)\b/i
  },
  {
    name: 'Express.js',
    category: 'Backend',
    aliases: ['express.js', 'expressjs', 'express'],
    pattern: /\b(express\.js|expressjs|express)\b/i
  },
  {
    name: 'Spring Boot',
    category: 'Backend',
    aliases: ['spring boot', 'springboot', 'spring framework'],
    pattern: /\b(spring\s*boot|springboot|spring\s+framework)\b/i
  },
  {
    name: 'REST APIs',
    category: 'Backend',
    aliases: ['rest api', 'rest apis', 'restful', 'restful apis', 'rest web services'],
    pattern: /\b(rest(\s*apis?|\s*ful(\s*apis?)?|\s*web\s*services)?)\b/i
  },

  // Databases
  {
    name: 'SQL',
    category: 'Databases',
    aliases: ['sql'],
    pattern: /\bsql\b/i
  },
  {
    name: 'MySQL',
    category: 'Databases',
    aliases: ['mysql'],
    pattern: /\bmysql\b/i
  },
  {
    name: 'MongoDB',
    category: 'Databases',
    aliases: ['mongodb', 'mongo', 'nosql'],
    pattern: /\b(mongodb|mongo|nosql)\b/i
  },

  // DevOps & Cloud
  {
    name: 'Git',
    category: 'DevOps & Tools',
    aliases: ['git', 'version control'],
    pattern: /\bgit\b(?!\s*hub)/i
  },
  {
    name: 'GitHub',
    category: 'DevOps & Tools',
    aliases: ['github'],
    pattern: /\bgithub\b/i
  },
  {
    name: 'Docker',
    category: 'DevOps & Tools',
    aliases: ['docker', 'containerization'],
    pattern: /\b(docker|containerization)\b/i
  },
  {
    name: 'AWS',
    category: 'DevOps & Tools',
    aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
    pattern: /\b(aws|amazon\s+web\s+services|ec2|s3|lambda)\b/i
  },

  // AI & Data Science
  {
    name: 'Machine Learning',
    category: 'AI & Data Science',
    aliases: ['machine learning', 'ml'],
    pattern: /\b(machine\s+learning|\bml\b)/i
  },
  {
    name: 'Deep Learning',
    category: 'AI & Data Science',
    aliases: ['deep learning', 'dl'],
    pattern: /\b(deep\s+learning|\bdl\b)/i
  },
  {
    name: 'NLP',
    category: 'AI & Data Science',
    aliases: ['nlp', 'natural language processing'],
    pattern: /\b(nlp|natural\s+language\s+processing)\b/i
  },
  {
    name: 'TensorFlow',
    category: 'AI & Data Science',
    aliases: ['tensorflow', 'tf'],
    pattern: /\b(tensorflow|\btf\b)/i
  },
  {
    name: 'PyTorch',
    category: 'AI & Data Science',
    aliases: ['pytorch'],
    pattern: /\bpytorch\b/i
  },
  {
    name: 'Pandas',
    category: 'AI & Data Science',
    aliases: ['pandas'],
    pattern: /\bpandas\b/i
  },
  {
    name: 'NumPy',
    category: 'AI & Data Science',
    aliases: ['numpy'],
    pattern: /\bnumpy\b/i
  },
  {
    name: 'Scikit-learn',
    category: 'AI & Data Science',
    aliases: ['scikit-learn', 'sklearn'],
    pattern: /\b(scikit-learn|sklearn)\b/i
  },
  {
    name: 'Data Structures and Algorithms',
    category: 'Core Computer Science',
    aliases: ['data structures and algorithms', 'dsa', 'data structures'],
    pattern: /\b(data\s+structures(\s+and\s+algorithms)?|\bdsa\b)/i
  }
];

/**
 * Normalizes an arbitrary skill name string to standard canonical name
 * @param {string} inputSkill 
 * @returns {string} Normalized canonical skill or trimmed input
 */
function normalizeSkill(inputSkill) {
  if (!inputSkill || typeof inputSkill !== 'string') return '';
  const clean = inputSkill.trim().toLowerCase();

  for (const def of SKILL_DEFINITIONS) {
    if (def.name.toLowerCase() === clean) return def.name;
    if (def.aliases.some(alias => alias.toLowerCase() === clean)) {
      return def.name;
    }
  }

  // Capitalize properly if unknown
  return inputSkill.trim();
}

/**
 * Extracts all recognized skills from a block of text
 * @param {string} text 
 * @returns {string[]} Array of unique canonical skill names
 */
function extractSkillsFromText(text) {
  if (!text || typeof text !== 'string') return [];

  const foundSkills = new Set();

  for (const def of SKILL_DEFINITIONS) {
    if (def.pattern.test(text)) {
      foundSkills.add(def.name);
    }
  }

  return Array.from(foundSkills);
}

module.exports = {
  SKILL_DEFINITIONS,
  normalizeSkill,
  extractSkillsFromText
};
