// routes/quiz.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const quizController = require('../controllers/quizController');

// Routes untuk admin web (tanpa auth)
router.get('/', quizController.getAllQuizzes);
router.get('/:id', quizController.getQuizById);
router.post('/', upload.fields([
  { name: 'image_0', maxCount: 1 },
  { name: 'image_1', maxCount: 1 },
  { name: 'image_2', maxCount: 1 },
  { name: 'image_3', maxCount: 1 },
  { name: 'image_4', maxCount: 1 }
]), quizController.createQuiz);

router.put('/:id', upload.fields([
    { name: 'image_0', maxCount: 1 },
    { name: 'image_1', maxCount: 1 },
    { name: 'image_2', maxCount: 1 },
    { name: 'image_3', maxCount: 1 },
    { name: 'image_4', maxCount: 1 }
  ]), quizController.updateQuiz);
  
router.delete('/:id', quizController.deleteQuiz);

module.exports = router;