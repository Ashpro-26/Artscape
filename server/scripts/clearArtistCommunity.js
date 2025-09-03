const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');
const ForumPost = require('../models/ForumPost');

// Connect to the artist-community database specifically
mongoose.connect('mongodb://localhost:27017/artist-community', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to artist-community database');
  
  try {
    console.log('🚀 Starting COMPLETE data reset for artist-community database...\n');
    
    // 1. Clear all forum posts and comments
    console.log('📝 Clearing forum posts and comments...');
    const forumResult = await ForumPost.deleteMany({});
    console.log(`✅ Deleted ${forumResult.deletedCount} forum posts\n`);
    
    // 2. Clear all artwork data
    console.log('🎨 Clearing all artwork data...');
    const artworkResult = await Artwork.deleteMany({});
    console.log(`✅ Deleted ${artworkResult.deletedCount} artworks\n`);
    
    // 3. Clear all artist profiles
    console.log('👨‍🎨 Clearing artist profiles...');
    const artistResult = await Artist.deleteMany({});
    console.log(`✅ Deleted ${artistResult.deletedCount} artist profiles\n`);
    
    // 4. Clear ALL user accounts (complete reset)
    console.log('👤 Clearing ALL user accounts...');
    const userResult = await User.deleteMany({});
    console.log(`✅ Deleted ${userResult.deletedCount} user accounts\n`);
    
    // 5. Clear all uploaded images
    console.log('🖼️ Clearing uploaded images...');
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      let deletedCount = 0;
      
      for (const file of files) {
        if (file.startsWith('image-')) {
          const filePath = path.join(uploadsDir, file);
          try {
            fs.unlinkSync(filePath);
            deletedCount++;
            console.log(`   Deleted: ${file}`);
          } catch (error) {
            console.log(`   Error deleting ${file}: ${error.message}`);
          }
        }
      }
      console.log(`✅ Deleted ${deletedCount} image files\n`);
    } else {
      console.log('⚠️ Uploads directory not found\n');
    }
    
    // 6. Display final statistics
    console.log('📊 Final Statistics:');
    const userCount = await User.countDocuments();
    const artistCount = await Artist.countDocuments();
    const artworkCount = await Artwork.countDocuments();
    const forumCount = await ForumPost.countDocuments();
    
    console.log(`   Users: ${userCount} (completely cleared)`);
    console.log(`   Artists: ${artistCount} (cleared)`);
    console.log(`   Artworks: ${artworkCount} (cleared)`);
    console.log(`   Forum Posts: ${forumCount} (cleared)`);
    
    console.log('\n🎉 COMPLETE RESET completed successfully!');
    console.log('✅ ALL data has been completely cleared from artist-community database.');
    console.log('✅ No user accounts remain.');
    console.log('✅ You can now start completely fresh!');
    
  } catch (error) {
    console.error('❌ Error during complete reset:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  }
});

