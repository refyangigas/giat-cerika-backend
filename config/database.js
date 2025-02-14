const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    
    // Log untuk debugging (akan muncul di Vercel logs)
    console.log('Database connection established at:', 
      process.env.MONGO_URI ? 
      process.env.MONGO_URI.replace(/:[^:]*@/, ':****@') : 
      'Not defined'
    );
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    console.error('Connection details:', {
      uri_defined: !!process.env.MONGO_URI,
      error_name: error.name,
      error_code: error.code
    });
    process.exit(1);
  }
};

module.exports = connectDB;