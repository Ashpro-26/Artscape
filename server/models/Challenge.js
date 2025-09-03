const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Sketching', 'Painting'],
  },
  week: {
    type: Number,
    required: true,
    unique: true,
  },
  year: {
    type: Number,
    required: true,
  },
  isSubmissionsOpen: {
    type: Boolean,
    default: true,
  },
  submissionEndDate: {
    type: Date,
    required: true,
  }
});

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;