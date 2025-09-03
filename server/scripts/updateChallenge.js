const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');

const updateChallenge = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');

    const challengeId = '68ad05e54334a8acdf980899'; // The ID of the challenge to update
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // Set to 7 days from now

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      challengeId,
      { $set: { submissionEndDate: futureDate } },
      { new: true }
    );

    if (updatedChallenge) {
      console.log('Challenge updated successfully:', updatedChallenge);
    } else {
      console.log('Challenge not found.');
    }
  } catch (err) {
    console.error(err.message);
  } finally {
    mongoose.connection.close();
  }
};

updateChallenge();
