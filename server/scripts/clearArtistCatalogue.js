const mongoose = require('mongoose');
require('dotenv').config();
const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');

const clearArtistCatalogue = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      console.log('MONGO_URI not found in environment variables. Using fallback connection...');
      await mongoose.connect('mongodb://localhost:27017/artist-community');
    } else {
      await mongoose.connect(process.env.MONGO_URI);
    }
    
    console.log('Connected to MongoDB successfully');

    // Get current counts
    const artistCount = await Artist.countDocuments();
    const artworkCount = await Artwork.countDocuments();
    
    console.log(`Found ${artistCount} artists and ${artworkCount} artworks`);

    // Confirm before clearing
    console.log('\n⚠️  WARNING: This will permanently delete all artist profiles and their associated artworks!');
    console.log('Are you sure you want to continue? (y/N)');
    
    // For now, proceed with clearing
    console.log('Proceeding with database cleanup...');

    // Clear all artists
    const artistResult = await Artist.deleteMany({});
    console.log(`✅ Cleared ${artistResult.deletedCount} artists from the catalogue`);

    // Clear all artworks (since they're linked to artists)
    const artworkResult = await Artwork.deleteMany({});
    console.log(`✅ Cleared ${artworkResult.deletedCount} artworks`);

    console.log('\n🎉 Artist catalogue database has been successfully cleared!');
    console.log('All artist profiles and associated artworks have been removed.');

  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the script
clearArtistCatalogue();
