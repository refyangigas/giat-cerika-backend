// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup direktori upload
const createUploadDirectories = () => {
  const dirs = [
    'uploads',
    'uploads/quiz'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Buat direktori saat server start
createUploadDirectories();

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/quiz');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `quiz-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Filter file
const fileFilter = (req, file, cb) => {
  // Hanya terima gambar
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('File harus berupa gambar'), false);
  }
};

// Setup multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

module.exports = upload;