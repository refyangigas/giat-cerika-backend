const Quiz = require('../models/Quiz');
const db = require('../config/database');

exports.getAllQuizzes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    // Buat query pencarian
    const query = search 
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        } 
      : {};
    
    // Hitung total dokumen untuk pagination
    const total = await Quiz.countDocuments(query);
    
    // Hitung total pages
    const totalPages = Math.ceil(total / limit);
    
    // Get quizzes dengan pagination dan sorting
    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: quizzes,
      page,
      totalPages,
      total,
      limit
    });
  } catch (error) {
    console.error('Error in getAllQuizzes:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz tidak ditemukan' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Files:', req.files);

    const { title, description, questions } = req.body;
    
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (error) {
      console.error('Error parsing questions:', error);
      return res.status(400).json({ message: 'Invalid questions format' });
    }

    // Proses images terlebih dahulu
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        const file = req.files[key];
        const questionIndex = parseInt(key.split('_')[1]);
        
        if (!isNaN(questionIndex) && questionIndex < parsedQuestions.length) {
          parsedQuestions[questionIndex].image = {
            url: `/uploads/${file[0].filename}`,
            filename: file[0].filename,
            size: file[0].size
          };
        }
      });
    }

    // Create quiz instance
    const quiz = new Quiz({
      title,
      description,
      questions: parsedQuestions
    });

    const savedQuiz = await quiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions } = req.body;
    
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (error) {
      console.error('Error parsing questions:', error);
      return res.status(400).json({ message: 'Invalid questions format' });
    }

    const existingQuiz = await Quiz.findById(id);
    if (!existingQuiz) {
      return res.status(404).json({ message: 'Quiz tidak ditemukan' });
    }
  
    // Merge existing images with new ones
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        const file = req.files[key][0];
        const questionIndex = parseInt(key.split('_')[1]);
        
        if (!isNaN(questionIndex) && questionIndex < parsedQuestions.length) {
          parsedQuestions[questionIndex].image = {
            url: `/uploads/${file.filename}`,
            filename: file.filename,
            size: file.size
          };
        }
      });
    }

    // Keep existing images if not updated
    parsedQuestions = parsedQuestions.map((question, index) => {
      if (!question.image && existingQuiz.questions[index]?.image) {
        return {
          ...question,
          image: existingQuiz.questions[index].image
        };
      }
      return question;
    });
  
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      {
        title,
        description,
        questions: parsedQuestions,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json(updatedQuiz);
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz tidak ditemukan' });
    }
    res.json({ message: 'Quiz berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};