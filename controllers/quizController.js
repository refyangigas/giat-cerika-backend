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
    console.log('Creating quiz with data:', {
      headers: req.headers,
      contentType: req.headers['content-type'],
      body: req.body
    });

    const quizData = req.body;
    
    // Basic validation
    if (!quizData || typeof quizData !== 'object') {
      return res.status(400).json({ 
        message: 'Invalid quiz data format',
        received: quizData 
      });
    }

    // Title validation
    if (!quizData.title || typeof quizData.title !== 'string') {
      return res.status(400).json({ 
        message: 'Judul quiz wajib diisi dan harus berupa text',
        received: quizData.title
      });
    }

    // Normalize data
    const normalizedData = {
      title: quizData.title.trim(),
      hasTimeLimit: Boolean(quizData.hasTimeLimit),
      timeLimit: {
        hours: Number(quizData.timeLimit?.hours) || 0,
        minutes: Number(quizData.timeLimit?.minutes) || 0,
        seconds: Number(quizData.timeLimit?.seconds) || 0
      },
      questions: Array.isArray(quizData.questions) ? quizData.questions.map((q, idx) => ({
        ...q,
        orderNumber: idx + 1,
        questionText: q.questionText?.trim() || '',
        image: q.image || null,
        options: Array.isArray(q.options) ? q.options.map(opt => ({
          text: opt.text?.trim() || '',
          isCorrect: Boolean(opt.isCorrect)
        })) : []
      })) : []
    };

    console.log('Normalized quiz data:', normalizedData);

    const quiz = new Quiz(normalizedData);
    const savedQuiz = await quiz.save();
    
    console.log('Successfully saved quiz:', savedQuiz._id);
    res.status(201).json(savedQuiz);

  } catch (error) {
    console.error('Error creating quiz:', {
      message: error.message,
      stack: error.stack,
      details: error
    });
    
    res.status(400).json({ 
      message: 'Gagal membuat quiz',
      error: error.message
    });
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const quizData = req.body;

    // Basic validation
    if (!quizData || typeof quizData !== 'object') {
      return res.status(400).json({ 
        message: 'Invalid quiz data format',
        received: quizData 
      });
    }

    // Normalize data
    const normalizedData = {
      title: quizData.title?.trim(),
      hasTimeLimit: Boolean(quizData.hasTimeLimit),
      timeLimit: {
        hours: Number(quizData.timeLimit?.hours) || 0,
        minutes: Number(quizData.timeLimit?.minutes) || 0,
        seconds: Number(quizData.timeLimit?.seconds) || 0
      },
      questions: Array.isArray(quizData.questions) ? quizData.questions.map((q, idx) => ({
        ...q,
        orderNumber: idx + 1,
        questionText: q.questionText?.trim() || '',
        image: q.image || null,
        options: Array.isArray(q.options) ? q.options.map(opt => ({
          text: opt.text?.trim() || '',
          isCorrect: Boolean(opt.isCorrect)
        })) : []
      })) : []
    };

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      normalizedData,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz tidak ditemukan' });
    }

    console.log('Successfully updated quiz:', quiz._id);
    res.json(quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
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
    const { questionOrders } = req.body;

    if (!Array.isArray(questionOrders)) {
      return res.status(400).json({ 
        message: 'questionOrders harus berupa array' 
      });
    }

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