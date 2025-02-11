const Materi = require('../models/Materi');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Get semua materi
exports.getAllMateri = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    // Implementasi search
    if (search) {
      query = {
        $or: [
          { judul: { $regex: search, $options: 'i' } },  // Case insensitive search di judul
          { konten: { $regex: search, $options: 'i' } }  // Case insensitive search di konten
        ]
      };
    }

    console.log('Search query:', query); // Debug log

    const materi = await Materi.find(query).sort({ createdAt: -1 });
    
    console.log(`Found ${materi.length} materials`); // Debug log
    
    res.json(materi);
  } catch (error) {
    console.error('Error in getAllMateri:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get materi by ID
exports.getMateriById = async (req, res) => {
  try {
    const materi = await Materi.findById(req.params.id);
    if (!materi) {
      return res.status(404).json({ message: 'Materi tidak ditemukan' });
    }
    res.json(materi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create materi baru
exports.createMateri = async (req, res) => {
  try {
    const { judul, konten } = req.body;
    
    // Validasi file
    if (req.file && !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ 
        message: 'File harus berupa gambar' 
      });
    }

    const materi = new Materi({
      judul,
      konten,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : null
    });

    const savedMateri = await materi.save();
    res.status(201).json(savedMateri);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update materi
exports.updateMateri = async (req, res) => {
  try {
    const { judul, konten } = req.body;
    const oldMateri = await Materi.findById(req.params.id);
    
    if (!oldMateri) {
      return res.status(404).json({ message: 'Materi tidak ditemukan' });
    }

    const updateData = {
      judul,
      konten
    };

    // Jika ada file baru
    if (req.file) {
      // Hapus file lama
      if (oldMateri.thumbnail) {
        const oldImagePath = path.join(__dirname, '..', oldMateri.thumbnail);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.thumbnail = `/uploads/${req.file.filename}`;
    }

    const materi = await Materi.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(materi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete materi
exports.deleteMateri = async (req, res) => {
  try {
    const materi = await Materi.findById(req.params.id);
    
    if (!materi) {
      return res.status(404).json({ message: 'Materi tidak ditemukan' });
    }

    // Hapus file gambar jika ada
    if (materi.thumbnail) {
      const imagePath = path.join(__dirname, '..', materi.thumbnail);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Materi.findByIdAndDelete(req.params.id);
    res.json({ message: 'Materi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};