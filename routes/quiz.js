const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const upload = require('./middleware/quizUpload');
const upload = require('../middleware/upload');
 
// Routes
router.get('/', quizController.getAllQuizzes);
router.get('/:id', quizController.getQuizById);
router.post('/', quizController.createQuiz);
router.put('/:id', quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);
router.post('/:quizId/reorder', quizController.reorderQuestions);

// Route untuk upload gambar pertanyaan
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Tidak ada file yang diupload' });
  }
  res.json({
    url: `/uploads/quiz/${req.file.filename}`
  });
});

module.exports = router;