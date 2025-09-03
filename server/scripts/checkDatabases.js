const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB admin database to list all databases
mongoose.connect('mongodb://localhost:27017/admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB admin');
  
  try {
    console.log('🔍 Checking all databases...\n');
    
    // List all databases
    const adminDb = db.db.admin();
    const dbList = await adminDb.listDatabases();
    
    console.log('📊 Available Databases:');
    dbList.databases.forEach(dbInfo => {
      console.log(`   - ${dbInfo.name} (${dbInfo.sizeOnDisk} bytes)`);
    });
    
    // Check specific databases for our collections
    const databasesToCheck = ['lets-create', 'artist-community', 'art-gallery'];
    
    for (const dbName of databasesToCheck) {
      console.log(`\n🔍 Checking database: ${dbName}`);
      
      try {
        const testDb = mongoose.connection.db.db(dbName);
        const collections = await testDb.listCollections().toArray();
        
        if (collections.length > 0) {
          console.log(`   Collections in ${dbName}:`);
          for (const collection of collections) {
            const count = await testDb.collection(collection.name).countDocuments();
            console.log(`     - ${collection.name}: ${count} documents`);
          }
        } else {
          console.log(`   No collections found in ${dbName}`);
        }
      } catch (error) {
        console.log(`   Could not access ${dbName}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking databases:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  }
});

