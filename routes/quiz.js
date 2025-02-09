const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const upload = require('../middleware/upload');

// Middleware untuk logging route spesifik quiz
const logQuizRequest = (req, res, next) => {
  console.log('Quiz Route:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    body: req.method === 'GET' ? null : req.body,
    params: req.params,
    query: req.query
  });
  next();
};

// Middleware untuk validasi ID
const validateId = (req, res, next) => {
  const id = req.params.id || req.params.quizId;
  if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid quiz ID format' });
  }
  next();
};

// Route untuk upload gambar pertanyaan
router.post('/upload-image', 
  upload.single('image'),
  (req, res) => {
    console.log('Upload image request:', {
      file: req.file,
      body: req.body
    });

    if (!req.file) {
      return res.status(400).json({ 
        message: 'Tidak ada file yang diupload',
        detail: 'File gambar wajib disertakan'
      });
    }

    // Validasi mime type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        message: 'File harus berupa gambar',
        detail: `Received: ${req.file.mimetype}`
      });
    }

    const fileUrl = `/uploads/quiz/${req.file.filename}`;
    console.log('File uploaded successfully:', {
      url: fileUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    res.json({ url: fileUrl });
  }
);

// Basic CRUD routes
router
  .route('/')
  .get(logQuizRequest, quizController.getAllQuizzes)
  .post(logQuizRequest, express.json(), quizController.createQuiz);

router
  .route('/:id')
  .get(logQuizRequest, validateId, quizController.getQuizById)
  .put(logQuizRequest, validateId, express.json(), quizController.updateQuiz)
  .delete(logQuizRequest, validateId, quizController.deleteQuiz);

// Route untuk reorder pertanyaan
router.post(
  '/:quizId/reorder',
  logQuizRequest,
  validateId,
  express.json(),
  quizController.reorderQuestions
);

// Error handler khusus untuk route quiz
router.use((err, req, res, next) => {
  console.error('Quiz Route Error:', {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    path: req.path
  });

  // Handle Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'Ukuran file terlalu besar',
      detail: 'Maksimal ukuran file adalah 2MB'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      message: 'File tidak diharapkan',
      detail: 'Hanya satu file gambar yang diperbolehkan'
    });
  }

  next(err);
});

module.exports = router;