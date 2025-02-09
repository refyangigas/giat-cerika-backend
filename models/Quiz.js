// models/Quiz.js
const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Teks opsi jawaban wajib diisi']
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const questionSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    required: true
  },
  questionText: {
    type: String,
    required: [true, 'Teks pertanyaan wajib diisi']
  },
  questionType: {
    type: String,
    enum: ['boolean', 'multiple'],
    required: true
  },
  image: {
    type: String,
    default: null
  },
  options: [optionSchema]
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul quiz wajib diisi'],
    trim: true
  },
  hasTimeLimit: {
    type: Boolean,
    default: false
  },
  timeLimit: {
    hours: {
      type: Number,
      default: 0,
      min: 0
    },
    minutes: {
      type: Number,
      default: 0,
      min: 0,
      max: 59
    },
    seconds: {
      type: Number,
      default: 0,
      min: 0,
      max: 59
    }
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Method untuk format waktu
quizSchema.methods.getFormattedTimeLimit = function() {
  if (!this.hasTimeLimit) return 'Tidak ada batas waktu';
  
  const parts = [];
  if (this.timeLimit.hours) parts.push(`${this.timeLimit.hours} jam`);
  if (this.timeLimit.minutes) parts.push(`${this.timeLimit.minutes} menit`);
  if (this.timeLimit.seconds) parts.push(`${this.timeLimit.seconds} detik`);
  
  return parts.length > 0 ? parts.join(' ') : '0 detik';
};

// Update timestamp sebelum save
quizSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);