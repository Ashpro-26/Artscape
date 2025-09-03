const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Digital Art', 'Traditional Art', 'Photography', 'Sculpture', 'Mixed Media', 'Other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: false // Already set to false
  },
  guestArtistName: { // New field for public uploads
    type: String,
    trim: true,
    required: false // Changed to false, as it's no longer sent from frontend
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better search performance
artworkSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Artwork', artworkSchema);