const Quiz = require('../models/Quiz');
const db = require('../config/database');

// Get semua quiz
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .select('title questions hasTimeLimit timeLimit createdAt')
      .sort({ createdAt: -1 });
    
    // Format response untuk tampilan list
    const formattedQuizzes = quizzes.map(quiz => ({
      _id: quiz._id,
      title: quiz.title,
      totalQuestions: quiz.questions.length,
      timeLimit: quiz.hasTimeLimit ? quiz.getFormattedTimeLimit() : 'Tidak ada batas waktu',
      createdAt: quiz.createdAt
    }));

    res.json(formattedQuizzes);
  } catch (error) {
    console.error('Error in getAllQuizzes:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz tidak ditemukan' });
    }
    res.json(quiz);
  } catch (error) {
    console.error('Error in getQuizById:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create quiz baru
exports.createQuiz = async (req, res) => {
    try {
      console.log('Received body:', req.body);
      console.log('Content-Type:', req.headers['content-type']);
      
      const quizData = req.body;
    
      // Validate required fields
    if (!quizData.title) {
        return res.status(400).json({ message: 'Judul quiz wajib diisi' });
      }

        // Initialize empty questions array if not provided
    if (!quizData.questions) {
        quizData.questions = [];
      }

    // Pastikan urutan pertanyaan benar
    if (quizData.questions) {
      quizData.questions = quizData.questions.map((question, index) => ({
        ...question,
        orderNumber: index + 1
      }));
    }

    const quiz = new Quiz(quizData);
    const savedQuiz = await quiz.save();
    console.log('Saved quiz:', savedQuiz);
    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error('Error in createQuiz:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const quizData = req.body;
    
    // Update urutan pertanyaan
    if (quizData.questions) {
      quizData.questions = quizData.questions.map((question, index) => ({
        ...question,
        orderNumber: index + 1
      }));
    }

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      quizData,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz tidak ditemukan' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Error in updateQuiz:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz tidak ditemukan' });
    }
    res.json({ message: 'Quiz berhasil dihapus' });
  } catch (error) {
    console.error('Error in deleteQuiz:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reorder questions
exports.reorderQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questionOrders } = req.body; // Array of { questionId, newOrder }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz tidak ditemukan' });
    }

    // Update urutan pertanyaan
    questionOrders.forEach(({ questionId, newOrder }) => {
      const question = quiz.questions.id(questionId);
      if (question) {
        question.orderNumber = newOrder;
      }
    });

    // Sort questions berdasarkan orderNumber
    quiz.questions.sort((a, b) => a.orderNumber - b.orderNumber);

    await quiz.save();
    res.json(quiz);
  } catch (error) {
    console.error('Error in reorderQuestions:', error);
    res.status(400).json({ message: error.message });
  }
};