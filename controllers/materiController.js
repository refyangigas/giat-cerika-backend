const Materi = require('../models/Materi');
const db = require('../config/database');

// Get semua materi
exports.getAllMateri = async (req, res) => {
  try {
    const materi = await Materi.find().sort({ createdAt: -1 });
    res.json(materi);
  } catch (error) {
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
    const updateData = {
      judul,
      konten
    };

    if (req.file) {
      updateData.thumbnail = `/uploads/${req.file.filename}`;
    }

    const materi = await Materi.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!materi) {
      return res.status(404).json({ message: 'Materi tidak ditemukan' });
    }

    res.json(materi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete materi
exports.deleteMateri = async (req, res) => {
  try {
    const materi = await Materi.findByIdAndDelete(req.params.id);
    if (!materi) {
      return res.status(404).json({ message: 'Materi tidak ditemukan' });
    }
    res.json({ message: 'Materi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};