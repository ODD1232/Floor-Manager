// backend/src/middleware/upload.js
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Ensure upload dirs exist
const dirs = [
  'uploads/photos',
  'uploads/aadhar',
  'uploads/resumes',
  'uploads/experience',
  'uploads/signatures',
];
dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));

// ── Storage engine ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const map = {
      photo:              'uploads/photos',
      aadharPhoto:        'uploads/aadhar',
      resume:             'uploads/resumes',
      experienceLetter:   'uploads/experience',
      relevanceLetter:    'uploads/experience',
      signature:          'uploads/signatures',
    };
    cb(null, map[file.fieldname] || 'uploads');
  },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// ── File type filter ──────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const images  = /jpeg|jpg|png|webp/;
  const docs    = /jpeg|jpg|png|webp|pdf/;
  const ext     = path.extname(file.originalname).toLowerCase().replace('.', '');

  if (['photo', 'aadharPhoto', 'signature'].includes(file.fieldname)) {
    return cb(null, images.test(ext));
  }
  cb(null, docs.test(ext));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// ── Named field config for Round 1 form ──────────────────────────────────────
const candidateUpload = upload.fields([
  { name: 'photo',            maxCount: 1 },
  { name: 'aadharPhoto',      maxCount: 1 },
  { name: 'resume',           maxCount: 1 },
  { name: 'experienceLetter', maxCount: 1 },
  { name: 'relevanceLetter',  maxCount: 1 },
]);

// ── Signature upload (single field) ──────────────────────────────────────────
const signatureUpload = upload.single('signature');

module.exports = { candidateUpload, signatureUpload };