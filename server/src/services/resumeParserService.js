const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { extractSkillsFromText, normalizeSkill } = require('../utils/skillDictionary');
const { extractOcrTextFromPdfBuffer } = require('./ocrService');

/**
 * Extracts raw text and metadata from ANY PDF or DOCX file
 * Automatically activates OCR for scanned, Canva, or image-based PDFs
 * @param {string} filePath 
 * @param {string} mimeType 
 * @returns {Promise<{text: string, isImagePdf: boolean, isOcr: boolean, meta: object}>}
 */
async function extractRawTextFromFile(filePath, mimeType) {
  if (!fs.existsSync(filePath)) {
    throw new Error('Resume file not found on disk.');
  }

  const fileBuffer = fs.readFileSync(filePath);

  if (fileBuffer.length === 0) {
    throw new Error('The uploaded file is empty.');
  }

  // Handle PDF
  if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
    try {
      const data = await pdfParse(fileBuffer);
      let text = data.text ? data.text.trim() : '';
      let isOcr = false;

      // If text stream is negligible (scanned paper, Canva flattened graphic, or image PDF)
      if (!text || text.length < 50) {
        console.log('[Parser] Insufficient text stream in PDF (<50 chars). Running automatic OCR...');
        try {
          const ocrText = await extractOcrTextFromPdfBuffer(fileBuffer);
          if (ocrText && ocrText.length > 20) {
            text = ocrText;
            isOcr = true;
            console.log(`[Parser] OCR successfully extracted ${text.length} characters.`);
          }
        } catch (ocrErr) {
          console.warn('[Parser] OCR extraction warning:', ocrErr.message);
        }
      }

      const meta = {
        title: data.info?.Title || '',
        author: data.info?.Author || '',
        creator: data.info?.Creator || '',
        producer: data.info?.Producer || ''
      };

      return {
        text,
        isImagePdf: isOcr || (!text || text.length < 50),
        isOcr,
        meta
      };
    } catch (err) {
      // Direct OCR fallback if pdf-parse fails completely
      try {
        const ocrText = await extractOcrTextFromPdfBuffer(fileBuffer);
        if (ocrText && ocrText.length > 20) {
          return {
            text: ocrText,
            isImagePdf: true,
            isOcr: true,
            meta: {}
          };
        }
      } catch (ocrFallbackErr) {
        // Fall through
      }
      throw new Error(`PDF Parsing failed: ${err.message}`);
    }
  }

  // Handle DOCX
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filePath.endsWith('.docx')
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const text = result.value ? result.value.trim() : '';
      return {
        text,
        isImagePdf: false,
        isOcr: false,
        meta: {}
      };
    } catch (err) {
      throw new Error(`DOCX Parsing failed: ${err.message}`);
    }
  }

  throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
}

/**
 * Parses raw resume text into structured candidate information
 * @param {string} rawText 
 * @returns {object} structured parsed resume data
 */
function parseResumeText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      name: '',
      email: '',
      phone: '',
      summary: '',
      education: [],
      skills: [],
      experience: [],
      projects: [],
      certifications: [],
      languages: [],
      achievements: []
    };
  }

  // Pre-clean common OCR artifacts and glued numbers/keywords
  let cleanedText = rawText
    .replace(/([a-zA-Z0-9._-]+)\s*\.\s*(com|edu|org|net|in|io|co|ac\.in)/gi, '$1.$2')
    .replace(/([a-zA-Z0-9._-]+)\s*@\s*([a-zA-Z0-9._-]+)/gi, '$1@$2')
    .replace(/SQT\b/g, 'SQL')
    .replace(/sirong\b/gi, 'strong')
    .replace(/Ilackathon\b/gi, 'Hackathon')
    .replace(/Tava\b/g, 'Java')
    .replace(/([a-zA-Z])((?:19|20)\d{2})/g, '$1 $2')
    .replace(/([a-zA-Z])(CGPA|Percentage|Percent)/gi, '$1 $2');

  // Insert line breaks before glued section headers (e.g. "JWT.EDUCATION", "data.PROJECTS")
  const ALL_SECTION_PATTERNS = [
    'CAREER SUMMARY', 'PROFESSIONAL SUMMARY', 'SUMMARY', 'PROFILE', 'CAREER OBJECTIVE', 'OBJECTIVE',
    'TECHNICAL SKILLS', 'KEY COMPETENCIES', 'CORE SKILLS', 'SKILLS & ABILITIES', 'SKILLS',
    'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT HISTORY', 'WORK HISTORY', 'EXPERIENCE', 'INTERNSHIPS',
    'PROJECTS', 'ACADEMIC PROJECTS', 'KEY PROJECTS', 'PERSONAL PROJECTS',
    'EDUCATION', 'ACADEMIC BACKGROUND', 'ACADEMICS', 'QUALIFICATIONS', 'ACADEMIC CREDENTIALS',
    'CERTIFICATIONS & ACHIEVEMENTS', 'CERTIFICATIONS AND ACHIEVEMENTS', 'CERTIFICATIONS', 'CERTIFICATES', 'ACHIEVEMENTS',
    'LANGUAGES KNOWN', 'SPOKEN LANGUAGES', 'LANGUAGES'
  ];
  ALL_SECTION_PATTERNS.sort((a, b) => b.length - a.length);

  for (const sec of ALL_SECTION_PATTERNS) {
    const pattern = new RegExp(`([\\.\\!\\?\\)»])\\s*(${sec})\\b`, 'gi');
    cleanedText = cleanedText.replace(pattern, '$1\n\n$2\n');
  }

  // Normalize lines and whitespace
  const lines = cleanedText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // 1. Email extraction regex
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  const emails = cleanedText.match(emailRegex) || [];
  const email = emails.length > 0 ? emails[0].toLowerCase() : '';

  // 2. Phone extraction regex (supports Indian +91 and international formats)
  const indianPhoneRegex = /(?:\+?91[\s-]?)?[6-9]\d{4}\s*\d{5}\b|(?:\+?91[\s-]?)?[6-9]\d{9}\b/;
  const globalPhoneRegex = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?|(\+?\d{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4})/;

  let phone = '';
  const inMatch = cleanedText.match(indianPhoneRegex);
  if (inMatch) {
    phone = inMatch[0].trim();
  } else {
    const globMatch = cleanedText.match(globalPhoneRegex);
    if (globMatch) phone = globMatch[0].trim();
  }

  // 3. Name extraction heuristic
  let name = '';
  const reservedHeaderWords = [
    'objective', 'career', 'summary', 'profile', 'education', 'experience',
    'projects', 'skills', 'certifications', 'curriculum', 'resume', 'page',
    'contact', 'developer', 'enthusiast', 'aspiring', 'engineer', 'teetcode', 'leetcode', 'github'
  ];

  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const candidateLine = lines[i].trim();
    const lower = candidateLine.toLowerCase();

    // Check if line contains reserved words or symbols
    const hasReserved = reservedHeaderWords.some(rw => lower.startsWith(rw) || lower === rw);
    if (hasReserved) continue;

    if (
      !candidateLine.includes('@') &&
      !candidateLine.includes('http') &&
      !candidateLine.includes('github') &&
      !candidateLine.includes('linkedin') &&
      !candidateLine.includes('|') &&
      !candidateLine.match(/\d{3,}/) &&
      candidateLine.length >= 3 &&
      candidateLine.length <= 40 &&
      candidateLine.split(/\s+/).length >= 1 &&
      candidateLine.split(/\s+/).length <= 4 &&
      /^[a-zA-Z\s.]+$/.test(candidateLine)
    ) {
      name = candidateLine;
      break;
    }
  }

  // 4. Section categorization
  const sections = {
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    languages: [],
    summary: []
  };

  function matchHeader(line) {
    if (!line) return null;
    // A header does not start with a bullet point
    if (/^[•\-\*«\+o\d\.]\s*/.test(line)) return null;
    // A header does not have a colon followed by content (e.g. "Tools: Git")
    if (/:\s*\S+/.test(line)) return null;
    // A header is short
    if (line.length > 40) return null;

    const upper = line.toUpperCase().replace(/[:_#=\-]/g, '').trim();

    if (/^(CAREER SUMMARY|PROFESSIONAL SUMMARY|SUMMARY|PROFILE|OBJECTIVE|ABOUT ME)$/i.test(upper)) return 'summary';
    if (/^(TECHNICAL SKILLS|KEY COMPETENCIES|CORE SKILLS|SKILLS & ABILITIES|SKILLS|TECHNOLOGIES)$/i.test(upper)) return 'skills';
    if (/^(WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EXPERIENCE|EMPLOYMENT HISTORY|INTERNSHIPS?)$/i.test(upper)) return 'experience';
    if (/^(PROJECTS|PERSONAL PROJECTS|ACADEMIC PROJECTS|KEY PROJECTS)$/i.test(upper)) return 'projects';
    if (/^(EDUCATION|ACADEMIC BACKGROUND|ACADEMICS|QUALIFICATIONS|ACADEMIC CREDENTIALS)$/i.test(upper)) return 'education';
    if (/^(CERTIFICATIONS? & ACHIEVEMENTS?|CERTIFICATIONS? AND ACHIEVEMENTS?|CERTIFICATIONS?|CERTIFICATES|ACHIEVEMENTS?|LICENSES)$/i.test(upper)) return 'certifications';
    if (/^(LANGUAGES KNOWN|LANGUAGES|SPOKEN LANGUAGES)$/i.test(upper)) return 'languages';

    return null;
  }

  let currentSection = null;
  for (const line of lines) {
    const matched = matchHeader(line);
    if (matched) {
      currentSection = matched;
    } else if (currentSection) {
      sections[currentSection].push(line);
    }
  }

  // 5. Skills extraction using comprehensive dictionary + section lines
  const extractedSkills = extractSkillsFromText(cleanedText);
  for (const sLine of sections.skills) {
    if (sLine.includes(':')) {
      const val = sLine.split(':')[1];
      const items = val.split(/[,|/•]/).map(i => i.trim().replace(/\.$/, '')).filter(Boolean);
      for (const item of items) {
        const norm = normalizeSkill(item);
        if (norm && !extractedSkills.includes(norm)) {
          extractedSkills.push(norm);
        }
      }
    }
  }
  const skills = Array.from(new Set(extractedSkills));

  // 6. Parse Education
  const education = [];
  const degreeRegex = /\b(b\.?tech|b\.?e\b|b\.?sc|bca|m\.?tech|m\.?e\b|m\.?sc|mca|bachelor|master|ph\.?d|diploma|associate|higher secondary|hsc|sslc|cbse|matric|12th|10th)\b/i;
  const yearRegex = /\b(19\d{2}|20\d{2})\s*(?:–|-|to)?\s*(present|19\d{2}|20\d{2})?\b/i;
  const gradeRegex = /\b(cgpa\s*:\s*[\d.]+(?:\/\d+)?|percentage\s*:\s*[\d.]+%?|[\d.]+\s*cgpa|[\d.]+%)\b/i;
  const schoolRegex = /(institute|college|university|school|academy|vidyalaya|campus|polytechnic)/i;

  let eduEntries = [];
  let currentEduBlock = [];

  for (const line of sections.education) {
    if (!line) continue;
    const hasSchool = schoolRegex.test(line);

    if (hasSchool && currentEduBlock.length > 0 && currentEduBlock.some(l => schoolRegex.test(l))) {
      eduEntries.push(currentEduBlock);
      currentEduBlock = [line];
    } else {
      currentEduBlock.push(line);
    }
  }
  if (currentEduBlock.length > 0) eduEntries.push(currentEduBlock);

  for (const block of eduEntries) {
    let degree = '';
    let institution = '';
    let fieldOfStudy = '';
    let year = '';
    let grade = '';

    for (const line of block) {
      const ym = line.match(yearRegex);
      if (ym && !year) year = ym[0].trim();

      const gm = line.match(gradeRegex);
      if (gm && !grade) grade = gm[0].trim();

      if (schoolRegex.test(line) && !institution) {
        institution = line.replace(yearRegex, '').replace(gradeRegex, '').replace(/[,–—\-]\s*$/, '').trim();
      }

      if (degreeRegex.test(line) && !degree) {
        const clean = line.replace(yearRegex, '').replace(gradeRegex, '').trim();
        const parts = clean.split(/[–—|-]/).map(p => p.trim()).filter(Boolean);
        degree = parts[0] || clean;
        if (parts.length > 1) {
          fieldOfStudy = parts.slice(1).join(' - ');
        }
      }

      if (/\b(hsc|sslc|higher secondary|matric|cbse|12th|10th)\b/i.test(line)) {
        const matched = line.match(/\b(hsc|sslc|higher secondary|matric|cbse|12th|10th)\b/i)[0].toUpperCase();
        if (matched === 'HSC') degree = 'Higher Secondary Certificate (HSC)';
        else if (matched === 'SSLC') degree = 'Secondary School Leaving Certificate (SSLC)';
        else if (!degree || degree.toLowerCase().includes('school')) degree = matched;
      }
    }

    if (degree || institution) {
      education.push({
        degree: degree || (institution.toLowerCase().includes('school') ? 'Higher Secondary' : 'Undergraduate Degree'),
        institution: institution || '',
        fieldOfStudy: fieldOfStudy || '',
        year: year || '',
        grade: grade || ''
      });
    }
  }

  // Fallback education if section headers were not explicitly marked
  if (education.length === 0) {
    for (const line of lines) {
      if ((degreeRegex.test(line) || schoolRegex.test(line)) && line.length < 100) {
        if (/experience|developing|foundations|passionate|programming/i.test(line)) continue;
        const ym = line.match(yearRegex);
        const gm = line.match(gradeRegex);
        education.push({
          degree: line.replace(yearRegex, '').replace(gradeRegex, '').trim(),
          institution: '',
          fieldOfStudy: '',
          year: ym ? ym[0].trim() : '',
          grade: gm ? gm[0].trim() : ''
        });
      }
    }
  }

  // 7. Parse Experience
  const experience = [];
  const roleKeywords = /\b(software engineer|developer|intern|analyst|architect|lead|associate|specialist|manager|consultant)\b/i;
  let currentExp = null;

  for (const line of sections.experience) {
    if (roleKeywords.test(line) && line.length < 90 && !/^[•\-\*«\+o]\s*/.test(line)) {
      if (currentExp) experience.push(currentExp);
      currentExp = {
        title: line,
        company: '',
        duration: '',
        description: '',
        skillsIdentified: extractSkillsFromText(line)
      };
    } else if (currentExp) {
      currentExp.description += (currentExp.description ? ' ' : '') + line.replace(/^[•\-\*«\+o]\s*/, '');
      const inlineSkills = extractSkillsFromText(line);
      for (const s of inlineSkills) {
        if (!currentExp.skillsIdentified.includes(s)) {
          currentExp.skillsIdentified.push(s);
        }
      }
    }
  }
  if (currentExp) experience.push(currentExp);

  // 8. Parse Projects
  function isLikelyProjectTitle(line, prevLine) {
    if (!line) return false;
    if (/^[•\-\*«\+o]\s*/.test(line)) return false;
    if (/^[a-z]/.test(line)) return false;
    if (/\.\s*$/.test(line) && !/(\.js|\.ai|\.io|\.net)$/i.test(line)) return false;
    if (/^(tech(nologies|\s*stack)?|tools(\s*used)?)\s*:/i.test(line)) return false;
    if (prevLine && /(,\s*$|-\s*$|\b(and|or|for|with|reducing|to|in)\s*$)/i.test(prevLine)) return false;
    if (line.length < 3 || line.length > 70) return false;
    return true;
  }

  const projects = [];
  let currentProj = null;
  let prevProjLine = '';

  for (let i = 0; i < sections.projects.length; i++) {
    const line = sections.projects[i].trim();
    if (!line) continue;

    const isTechStack = /^(•\s*)?(tech(nologies|\s*stack)?|tools(\s*used)?)\s*:/i.test(line);

    if (isLikelyProjectTitle(line, prevProjLine)) {
      if (currentProj) projects.push(currentProj);
      currentProj = {
        title: line,
        description: '',
        technologies: []
      };
      prevProjLine = line;
      continue;
    }

    if (!currentProj) {
      currentProj = {
        title: line.replace(/^[•\-\*«\+o]\s*/, '').slice(0, 50),
        description: '',
        technologies: []
      };
    }

    if (isTechStack) {
      const techListStr = line.replace(/^(•\s*)?(tech(nologies|\s*stack)?|tools(\s*used)?)\s*:\s*/i, '');
      const techs = techListStr.split(/[,|•;]/).map(t => t.trim().replace(/\.$/, '')).filter(Boolean);
      for (const t of techs) {
        if (!currentProj.technologies.includes(t)) {
          currentProj.technologies.push(t);
        }
      }
    } else {
      const cleanBullet = line.replace(/^[•\-\*«\+o]\s*/, '').trim();
      if (currentProj.description) {
        if (currentProj.description.endsWith('-')) {
          currentProj.description = currentProj.description.slice(0, -1) + cleanBullet;
        } else {
          currentProj.description += ' ' + cleanBullet;
        }
      } else {
        currentProj.description = cleanBullet;
      }
    }

    prevProjLine = line;
  }
  if (currentProj) projects.push(currentProj);

  // 9. Parse Certifications & Languages
  const certifications = [];
  const languages = [];
  const spokenLangKeywords = /\b(english|telugu|tamil|hindi|french|german|spanish|malayalam|kannada|marathi|bengali|gujarati|intermediate|fluent|native|proficient|beginner)\b/i;

  for (const line of sections.certifications) {
    if (line.length < 3 || line.length > 200) continue;
    const cleanLine = line.replace(/^[•\-\*«\+o]\s*/, '').trim();

    if (spokenLangKeywords.test(cleanLine) && !/python|java|c\+\+|node|react|aws|cloud/i.test(cleanLine)) {
      const langItems = cleanLine.split(/[—–|,]/).map(l => l.trim()).filter(Boolean);
      for (const li of langItems) {
        if (spokenLangKeywords.test(li) && !languages.includes(li)) {
          languages.push(li);
        }
      }
      continue;
    }

    const parts = cleanLine.split(/—|–|-/).map(p => p.trim());
    let title = cleanLine;
    let issuer = '';

    if (parts.length >= 2) {
      const firstIsOrg = /^(deloitte|nptel|coursera|udemy|google|microsoft|aws|the linux foundation|ibm|cisco|harvard|edx|simplilearn)\b/i.test(parts[0]);
      if (firstIsOrg) {
        issuer = parts[0];
        title = parts.slice(1).join(' - ');
      } else {
        title = parts[0];
        issuer = parts.slice(1).join(' - ');
      }
    }

    const ym = cleanLine.match(/\b(20\d{2})\b/);
    const year = ym ? ym[1] : '';

    certifications.push({
      title,
      name: title,
      issuer,
      year,
      issueDate: year
    });
  }

  for (const line of sections.languages) {
    if (!line) continue;
    const cleanLine = line.replace(/^[•\-\*«\+o]\s*/, '').trim();
    const langItems = cleanLine.split(/[—–|,]/).map(l => l.trim()).filter(Boolean);
    for (const li of langItems) {
      if (!languages.includes(li)) {
        languages.push(li);
      }
    }
  }

  return {
    name,
    email,
    phone,
    summary: sections.summary.join(' ').slice(0, 500),
    education,
    skills,
    experience,
    projects,
    certifications,
    languages,
    achievements: []
  };
}

module.exports = {
  extractRawTextFromFile,
  parseResumeText
};
