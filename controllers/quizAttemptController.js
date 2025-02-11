const QuizAttempt = require('../models/QuizAttempt');
const db = require('../config/database');

exports.submitQuizAttempt = async (req, res) => {
  try {
    const { user, quiz, score, answers } = req.body;

    const quizAttempt = new QuizAttempt({
      user,
      quiz,
      score,
      answers: answers.map(answer => ({
        question: answer.question,
        selectedOption: answer.selectedOption,
        isCorrect: answer.isCorrect
      }))
    });

    const savedAttempt = await quizAttempt.save();
    res.status(201).json(savedAttempt);
  } catch (error) {
    console.error('Error in submitQuizAttempt:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserQuizAttempts = async (req, res) => {
  try {
    const { userId } = req.params;
    const attempts = await QuizAttempt.find({ user: userId })
      .populate('quiz', 'title')
      .sort({ completedAt: -1 });
    res.json(attempts);
  } catch (error) {
    console.error('Error in getUserQuizAttempts:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getQuizAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const attempt = await QuizAttempt.findById(id)
      .populate('quiz')
      .populate('user', 'username');
    
    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }
    
    res.json(attempt);
  } catch (error) {
    console.error('Error in getQuizAttempt:', error);
    res.status(500).json({ message: error.message });
  }
};