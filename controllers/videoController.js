const Video = require('../models/Video');
const db = require('../config/database');

// Get semua video
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error('Error in getAllVideos:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create video baru
exports.createVideo = async (req, res) => {
  try {
    const { judul, youtube_url } = req.body;
    
    // Validasi URL YouTube
    try {
      const urlObj = new URL(youtube_url);
      if (!urlObj.hostname.includes('youtube.com') || !urlObj.searchParams.has('v')) {
        return res.status(400).json({ 
          message: 'URL YouTube tidak valid! Gunakan format: https://www.youtube.com/watch?v=...' 
        });
      }
    } catch (error) {
      return res.status(400).json({ 
        message: 'URL tidak valid!' 
      });
    }

    const video = new Video({
      judul,
      youtube_url
    });

    const savedVideo = await video.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    console.error('Error in createVideo:', error);
    res.status(400).json({ 
      message: error.message || 'Terjadi kesalahan saat menyimpan video' 
    });
  }
};

// Get video by ID
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video tidak ditemukan' });
    }
    res.json(video);
  } catch (error) {
    console.error('Error in getVideoById:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update video
exports.updateVideo = async (req, res) => {
  try {
    const { judul, youtube_url } = req.body;
    
    // Validasi URL YouTube
    if (youtube_url) {
      try {
        const urlObj = new URL(youtube_url);
        if (!urlObj.hostname.includes('youtube.com') || !urlObj.searchParams.has('v')) {
          return res.status(400).json({ 
            message: 'URL YouTube tidak valid! Gunakan format: https://www.youtube.com/watch?v=...' 
          });
        }
      } catch (error) {
        return res.status(400).json({ 
          message: 'URL tidak valid!' 
        });
      }
    }

    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { judul, youtube_url },
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({ message: 'Video tidak ditemukan' });
    }
    res.json(video);
  } catch (error) {
    console.error('Error in updateVideo:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete video
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video tidak ditemukan' });
    }
    res.json({ message: 'Video berhasil dihapus' });
  } catch (error) {
    console.error('Error in deleteVideo:', error);
    res.status(500).json({ message: error.message });
  }
};