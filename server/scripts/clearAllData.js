const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');
const ForumPost = require('../models/ForumPost');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/art-gallery', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    console.log('🚀 Starting comprehensive data cleanup...\n');
    
    // 1. Clear all forum posts and comments
    console.log('📝 Clearing forum posts and comments...');
    const forumResult = await ForumPost.deleteMany({});
    console.log(`✅ Deleted ${forumResult.deletedCount} forum posts\n`);
    
    // 2. Clear all artwork data
    console.log('🎨 Clearing all artwork data...');
    const artworkResult = await Artwork.deleteMany({});
    console.log(`✅ Deleted ${artworkResult.deletedCount} artworks\n`);
    
    // 3. Clear all artist profiles (but keep user accounts)
    console.log('👨‍🎨 Clearing artist profiles...');
    const artistResult = await Artist.deleteMany({});
    console.log(`✅ Deleted ${artistResult.deletedCount} artist profiles\n`);
    
    // 4. Reset user profile data (bio, avatar) but keep credentials
    console.log('👤 Resetting user profile data...');
    const userUpdateResult = await User.updateMany(
      {},
      {
        $unset: {
          bio: "",
          avatar: ""
        }
      }
    );
    console.log(`✅ Reset profile data for ${userUpdateResult.modifiedCount} users\n`);
    
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
    
    console.log(`   Users: ${userCount} (preserved with credentials)`);
    console.log(`   Artists: ${artistCount} (cleared)`);
    console.log(`   Artworks: ${artworkCount} (cleared)`);
    console.log(`   Forum Posts: ${forumCount} (cleared)`);
    
    console.log('\n🎉 Data cleanup completed successfully!');
    console.log('✅ All art gallery data, images, portfolios, and forum posts have been cleared.');
    console.log('✅ User account credentials have been preserved.');
    console.log('✅ You can now set up your art gallery fresh!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  }
});

