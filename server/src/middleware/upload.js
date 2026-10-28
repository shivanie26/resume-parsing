const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with secure unique naming
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate crypto random filename to prevent collisions and path traversal
    const randomHex = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume_${Date.now()}_${randomHex}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error('Invalid file format. Only PDF (.pdf) and Word (.docx) files are supported.'),
      false
    );
  }

  // Broad MIME validation allowing standard browser variants
  const allowedMimeTypes = [
    'application/pdf',
    'application/x-pdf',
    'application/acrobat',
    'applications/vnd.pdf',
    'text/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/octet-stream',
    'binary/octet-stream'
  ];

  if (
    file.mimetype &&
    !allowedMimeTypes.includes(file.mimetype) &&
    !file.mimetype.includes('pdf') &&
    !file.mimetype.includes('word') &&
    !file.mimetype.includes('document') &&
    !file.mimetype.includes('stream')
  ) {
    return cb(
      new Error(`Invalid MIME type '${file.mimetype}'. Only PDF and DOCX documents are accepted.`),
      false
    );
  }

  cb(null, true);
};

// 5 MB maximum file size limit
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter
});

module.exports = upload;
