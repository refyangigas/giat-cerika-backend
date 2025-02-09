const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Buat folder untuk menyimpan gambar quiz jika belum ada
const uploadDir = 'uploads/quiz';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'quiz-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter file
const fileFilter = (req, file, cb) => {
  // Hanya terima gambar
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('File harus berupa gambar!'), false);
  }
};

// Setup multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB
  },
  fileFilter: fileFilter
});

module.exports = upload;