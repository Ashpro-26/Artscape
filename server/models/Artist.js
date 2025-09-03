const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  bio: {
    type: String
  },
  portfolio: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork'
  }],
  contactInformation: {
    email: {
      type: String
    },
    phone: {
      type: String
    },
    website: {
      type: String
    }
  },
  serviceCharges: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Link to the User model for authentication
  }
});

module.exports = mongoose.model('Artist', ArtistSchema);