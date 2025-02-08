const mongoose = require('mongoose');

// Schema untuk opsi jawaban
const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
});

// Schema untuk pertanyaan
const questionSchema = new mongoose.Schema({
  orderNumber: { type: Number, required: true },
  questionText: { type: String, required: true },
  image: { type: String }, // URL gambar (opsional)
  questionType: { 
    type: String, 
    required: true,
    enum: ['boolean', 'multiple'] // tipe soal: benar/salah atau pilihan ganda
  },
  options: [optionSchema]
});

// Schema utama Quiz
const quizSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  timeLimit: {
    hours: { type: Number, default: 0 },
    minutes: { type: Number, default: 0 },
    seconds: { type: Number, default: 0 }
  },
  hasTimeLimit: { 
    type: Boolean, 
    default: false 
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

// Middleware untuk mengupdate updatedAt sebelum save
quizSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method untuk menghitung total waktu dalam detik
quizSchema.methods.getTotalSeconds = function() {
  return (this.timeLimit.hours * 3600) + 
         (this.timeLimit.minutes * 60) + 
         this.timeLimit.seconds;
};

// Method untuk mendapatkan format waktu yang readable
quizSchema.methods.getFormattedTimeLimit = function() {
  if (!this.hasTimeLimit) return 'Tidak ada batas waktu';
  
  const parts = [];
  if (this.timeLimit.hours > 0) parts.push(`${this.timeLimit.hours} jam`);
  if (this.timeLimit.minutes > 0) parts.push(`${this.timeLimit.minutes} menit`);
  if (this.timeLimit.seconds > 0) parts.push(`${this.timeLimit.seconds} detik`);
  
  return parts.length > 0 ? parts.join(' ') : '0 detik';
};

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;