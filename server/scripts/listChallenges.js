const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');

// Connect to the database
mongoose.connect('mongodb://localhost:27017/artist-community', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to the database');
  return Challenge.findOne({week: 36, year: 2025});
})
.then(challenge => {
  console.log('Challenge:', challenge);
  mongoose.connection.close();
})
.catch(err => {
  console.error('Error connecting to the database:', err);
});