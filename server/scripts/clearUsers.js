const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to the database
mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to the database');
  return User.deleteMany({});
})
.then(() => {
  console.log('All user accounts have been removed.');
  mongoose.connection.close();
})
.catch(err => {
  console.error('Error connecting to the database:', err);
});
