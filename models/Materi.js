const mongoose = require('mongoose');

const materiSchema = new mongoose.Schema({
  judul: { 
    type: String, 
    required: true 
  },
  konten: { 
    type: String, 
    required: true 
  },
  thumbnail: { 
    type: String, 
    required: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Materi', materiSchema);