require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// server.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/materi', require('./routes/materi')); 
app.use('/api/video', require('./routes/video'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/quiz-attempt', require('./routes/quizAttempt'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload directory: ${path.join(__dirname, 'uploads')}`);
});