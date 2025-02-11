// cleanup.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Materi = require('./models/Materi');
require('dotenv').config();

async function cleanupUnusedImages() {
  try {
    // Connect to MongoDB - Perbaiki nama variabel env
    await mongoose.connect(process.env.MONGO_URI);
    
    // Get all materi documents
    const materis = await Materi.find({}, 'thumbnail');
    const usedThumbnails = materis.map(m => m.thumbnail).filter(Boolean);
    
    // Read uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir);
    
    // Check each file
    let deletedCount = 0;  // Tambah counter
    files.forEach(file => {
      const filePath = `/uploads/${file}`;
      if (!usedThumbnails.includes(filePath)) {
        fs.unlinkSync(path.join(uploadsDir, file));
        console.log(`Deleted unused file: ${file}`);
        deletedCount++;
      }
    });

    console.log(`Cleanup completed. Deleted ${deletedCount} unused files`);
    await mongoose.connection.close(); // Pastikan koneksi ditutup
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

cleanupUnusedImages();