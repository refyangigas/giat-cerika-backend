require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

const app = express();

// Setup directory structure
const setupDirectories = () => {
  const directories = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads', 'quiz')
  ];

  directories.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        // Set permissions (755 = rwxr-xr-x)
        fs.chmodSync(dir, '755');
        console.log(`Created and configured directory: ${dir}`);
      }
    } catch (error) {
      console.error(`Error setting up directory ${dir}:`, error);
      // Tidak throw error karena aplikasi masih bisa berjalan tanpa direktori upload
    }
  });
};

// Run directory setup
setupDirectories();

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Basic Middleware
app.use(cors());

// JSON parsing dengan validasi
app.use(express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      throw new Error('Invalid JSON format');
    }
  }
}));

app.use(express.urlencoded({ extended: true }));

// Serve static files dari folder uploads dengan security headers
app.use('/uploads', (req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
  });
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Middleware untuk logging requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/materi', require('./routes/materi'));
app.use('/api/video', require('./routes/video'));
app.use('/api/quiz', require('./routes/quiz'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.url
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    timestamp: new Date().toISOString(),
    message: err.message,
    stack: err.stack,
    path: req.url,
    method: req.method,
    body: req.body
  });

  // Handle specific error types
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'File terlalu besar. Maksimal 2MB'
    });
  }

  if (err.message === 'Invalid JSON format') {
    return res.status(400).json({
      message: 'Format JSON tidak valid',
      details: err.message
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'Format request tidak valid',
      details: err.message
    });
  }

  // Default error response
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: statusCode === 500 ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Upload directory: ${path.join(__dirname, 'uploads')}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});