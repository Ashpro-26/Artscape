const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      console.log('MONGODB_URI not found in environment variables. Using fallback connection...');
      // For development, you can use a local MongoDB or MongoDB Atlas
      const fallbackURI = 'mongodb://localhost:27017/artist-community';
      await mongoose.connect(fallbackURI);
    } else {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    console.log('MongoDB connected successfully');
    console.log(`Connected to database: ${mongoose.connection.name}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Please make sure MongoDB is running or update your MONGO_URI in .env file');
    console.log('For development, you can:');
    console.log('1. Install MongoDB locally');
    console.log('2. Use MongoDB Atlas (cloud)');
    console.log('3. Use a different database');
    // Don't exit the process, let the server run without DB for now
  }
};

module.exports = connectDB; 