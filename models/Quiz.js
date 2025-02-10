const mongoose = require('mongoose');

// Schema untuk opsi jawaban
const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true }
});

// Schema untuk gambar (dipisah agar lebih jelas)
const imageSchema = new mongoose.Schema({
  url: String,
  filename: String,
  size: Number
}, { _id: false }); // _id: false agar tidak generate ID untuk sub-document

// Schema untuk pertanyaan
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  image: imageSchema, // gambar opsional sebagai sub-document
  options: [optionSchema],
  type: { 
    type: String, 
    required: true,
    enum: ['boolean', 'multiple'] // boolean untuk benar/salah, multiple untuk A-D
  }
});

// Validasi ukuran gambar (hanya jika ada gambar)
questionSchema.pre('save', function(next) {
  if (this.image && this.image.size && this.image.size > 2 * 1024 * 1024) { // 2MB
    next(new Error('Image size cannot exceed 2MB'));
  }
  next();
});

// Schema utama quiz
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook untuk update timestamps
quizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);