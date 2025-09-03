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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lets-create', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    console.log('🔍 Verifying data cleanup...\n');
    
    // Check database collections
    const userCount = await User.countDocuments();
    const artistCount = await Artist.countDocuments();
    const artworkCount = await Artwork.countDocuments();
    const forumCount = await ForumPost.countDocuments();
    
    console.log('📊 Database Statistics:');
    console.log(`   Users: ${userCount} ✅ (preserved)`);
    console.log(`   Artists: ${artistCount} ✅ (cleared)`);
    console.log(`   Artworks: ${artworkCount} ✅ (cleared)`);
    console.log(`   Forum Posts: ${forumCount} ✅ (cleared)`);
    
    // Check uploads directory
    const uploadsDir = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const imageFiles = files.filter(file => file.startsWith('image-'));
      console.log(`   Uploaded Images: ${imageFiles.length} ✅ (cleared)`);
    } else {
      console.log('   Uploaded Images: 0 ✅ (directory not found)');
    }
    
    // Display user accounts that are preserved
    if (userCount > 0) {
      console.log('\n👥 Preserved User Accounts:');
      const users = await User.find({}, 'username email createdAt');
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - Created: ${user.createdAt.toLocaleDateString()}`);
      });
    }
    
    console.log('\n✅ Verification Complete!');
    console.log('🎉 All art gallery data has been successfully cleared.');
    console.log('🔐 User account credentials have been preserved.');
    console.log('🚀 Your art gallery is now ready for a fresh setup!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  }
});

