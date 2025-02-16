const express = require('express');
const router = express.Router();
const quizAttemptController = require('../controllers/quizAttemptController');
const auth = require('../middleware/auth');

// Submit quiz attempt
router.post('/submit', quizAttemptController.submitQuizAttempt);

// Get user's quiz attempts
router.get('/user/:userId', quizAttemptController.getUserQuizAttempts);

// Get specific quiz attempt
router.get('/latest', auth, quizAttemptController.getLatestAttempts);
router.get('/:id', quizAttemptController.getQuizAttempt);

// Get all quiz attempts (admin only)
router.get('/admin/all', quizAttemptController.getAllQuizAttempts);

module.exports = router;