const express = require('express');
const router = express.Router();
const quizAttemptController = require('../controllers/quizAttemptController');

// Submit quiz attempt
router.post('/submit', quizAttemptController.submitQuizAttempt);

// Get user's quiz attempts
router.get('/user/:userId', quizAttemptController.getUserQuizAttempts);

// Get specific quiz attempt
router.get('/:id', quizAttemptController.getQuizAttempt);

module.exports = router;