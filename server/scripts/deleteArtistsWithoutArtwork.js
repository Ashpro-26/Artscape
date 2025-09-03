require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Artist = require('../models/Artist');
const User = require('../models/User');
const connectDB = require('../db');

const deleteArtistsWithoutArtwork = async () => {
  try {
    await connectDB();

    const artistsToDelete = await Artist.find({ portfolio: { $size: 0 } });

    if (artistsToDelete.length === 0) {
      console.log('No artists with empty portfolios found.');
      return;
    }

    console.log(`Found ${artistsToDelete.length} artists to delete.`);

    for (const artist of artistsToDelete) {
      console.log(`Deleting artist: ${artist.name} (${artist._id})`);

      // Find the user associated with the artist
      const user = await User.findById(artist.user);

      // Delete the artist
      await Artist.findByIdAndDelete(artist._id);

      // Update the user
      if (user) {
        user.isArtist = false;
        await user.save();
        console.log(`Updated user: ${user.username}`);
      }
    }

    console.log('Cleanup complete.');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    mongoose.disconnect();
  }
};

deleteArtistsWithoutArtwork();
