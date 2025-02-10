const Materi = require('../models/Materi');
const Video = require('../models/Video');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const db = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    const totalMateri = await Materi.countDocuments();
    const totalVideo = await Video.countDocuments();
    const totalUser = await User.countDocuments();
    const totalQuiz = await Quiz.countDocuments();

    // Get recent items (limit to 5)
    const recentMateri = await Materi.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('judul createdAt');
    
    const recentVideo = await Video.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('judul createdAt');
    
    const recentQuiz = await Quiz.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt');

    res.json({
      stats: {
        totalMateri,
        totalVideo,
        totalUser,
        totalQuiz
      },
      recent: {
        materi: recentMateri,
        video: recentVideo,
        quiz: recentQuiz
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting dashboard stats', error: error.message });
  }
};

module.exports = {
  getDashboardStats
};