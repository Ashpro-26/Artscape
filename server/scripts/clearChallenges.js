const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const connectDB = require('../db');

const clearChallenges = async () => {
  await connectDB();
  try {
    console.log('Clearing challenges...');
    await Challenge.deleteMany({});
    console.log('Challenges cleared successfully!');
  } catch (error) {
    console.error('Error clearing challenges:', error);
  } finally {
    mongoose.disconnect();
  }
};

clearChallenges();
