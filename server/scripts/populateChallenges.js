const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const connectDB = require('../db');

// Helper function to get the date of the Sunday of a given week
function getSundayOfWeek(year, week) {
  const d = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  d.setUTCDate(d.getUTCDate() + 7 - d.getUTCDay());
  return d;
}

const challenges = [
  {
    title: 'Sketch a Still Life',
    description: 'Arrange a few everyday objects and sketch them from observation. Focus on light and shadow.',
    category: 'Sketching',
    week: 35,
    year: 2025,
  },
  {
    title: 'Paint a Landscape',
    description: 'Create a painting of a natural landscape. Experiment with different color palettes.',
    category: 'Painting',
    week: 36,
    year: 2025,
  },
  {
    title: 'Sketch a Portrait',
    description: 'Draw a portrait of a friend, family member, or even yourself. Pay attention to facial proportions.',
    category: 'Sketching',
    week: 37,
    year: 2025,
  },
  {
    title: 'Paint an Abstract Piece',
    description: 'Express your emotions through an abstract painting. Use colors and shapes freely.',
    category: 'Painting',
    week: 38,
    year: 2025,
  },
];

const populateChallenges = async () => {
  await connectDB();
  try {
    console.log('Populating challenges...');
    for (const challengeData of challenges) {
      const existingChallenge = await Challenge.findOne({ week: challengeData.week, year: challengeData.year });
      if (!existingChallenge) {
        const submissionEndDate = getSundayOfWeek(challengeData.year, challengeData.week);
        const newChallenge = new Challenge({ ...challengeData, submissionEndDate });
        await newChallenge.save();
        console.log(`Added challenge for week ${challengeData.week}, year ${challengeData.year}`);
      } else {
        console.log(`Challenge for week ${challengeData.week}, year ${challengeData.year} already exists. Skipping.`);
      }
    }
    console.log('Challenges populated successfully!');
  } catch (error) {
    console.error('Error populating challenges:', error);
  } finally {
    mongoose.disconnect();
  }
};

populateChallenges();