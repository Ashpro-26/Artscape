const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const Artist = require('../models/Artist');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Store files in the uploads folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `image-${Date.now()}${ext}`); // Rename the file
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 25
  }, // Limit file size to 25MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// Upload artwork to portfolio (private by default)
router.post('/portfolio/upload', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const imageUrl = req.file ? req.file.filename : null;

    const artist = await Artist.findOne({ user: req.user.userId });
    if (!artist) {
      return res.status(404).json({ msg: 'Artist profile not found' });
    }

    const artwork = new Artwork({
      title,
      description,
      price,
      category,
      imageUrl,
      artist: artist._id,
      isPublic: false // Private by default
    });

    await artwork.save();

    // Update artist's portfolio
    artist.portfolio.push(artwork._id);
    await artist.save();

    res.status(201).json({
      msg: 'Artwork uploaded to portfolio successfully',
      artwork
    });
  } catch (err) {
    console.error('Portfolio upload error:', err);
    res.status(500).send('Server Error: ' + err.message);
  }
});

router.post('/gallery/upload', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const imageUrl = req.file ? req.file.filename : null;

    // Find the artist profile associated with the user
    const artist = await Artist.findOne({ user: req.user.userId });
    if (!artist) {
        return res.status(404).json({ msg: 'Artist profile not found' });
    }

    const artwork = new Artwork({
      title,
      description,
      price,
      category,
      imageUrl,
      artist: artist._id, // Associate with the artist
      isPublic: true // Public by default
    });

    await artwork.save();

    res.status(201).json({
      msg: 'Artwork uploaded to gallery successfully',
      artwork
    });
  } catch (err) {
    console.error('Gallery upload error:', err);
    res.status(500).send('Server Error: ' + err.message);
  }
});

// NEW: Public artwork upload route (no authentication required)
router.post('/public-upload', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body; // guestArtistName is no longer expected
    const imageUrl = req.file ? req.file.filename : null;

    if (!imageUrl) {
      return res.status(400).json({ msg: 'No image file provided.' });
    }

    const artwork = new Artwork({
      title,
      description,
      category,
      imageUrl,
      // guestArtistName is intentionally omitted here
      isPublic: true, // Mark as public
      artist: undefined // Ensure artist field is not set for guest uploads
    });

    await artwork.save();

    res.status(201).json({
      msg: 'Public artwork uploaded successfully! It will appear in the gallery after review.',
      artwork
    });
  } catch (err) {
    // More detailed error logging
    console.error('Public artwork upload error:', err.message);
    console.error('Error details:', err); // Log the full error object for more context
    res.status(500).send('Server Error: ' + err.message);
  }
});


// Get all public artworks
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    
    let query = { isPublic: true };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search && search.trim()) {
      // Use regex for flexible search instead of $text
      const searchRegex = new RegExp(search.trim(), 'i'); // 'i' for case-insensitive
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { guestArtistName: searchRegex } // Include guestArtistName in search
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const artworks = await Artwork.find(query)
      .populate('artist', 'username avatar') // Still populate artist for registered users
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Artwork.countDocuments(query);
    
    res.json({
      artworks,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get artworks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get artwork by ID
router.get('/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .populate({
        path: 'artist',
        populate: {
          path: 'user',
          select: 'username'
        }
      })
      .populate('likes', 'username');
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    // Increment views
    artwork.views += 1;
    await artwork.save();
    
    res.json(artwork);
  } catch (error) {
    console.error('Get artwork error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update artwork (protected route)
router.put('/:id', auth, async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    // If artwork has an associated artist, check ownership
    if (artwork.artist && artwork.artist.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // If artwork is public (no associated artist), only admins or specific roles might update.
    // For now, only the original artist can update their own artwork.
    // Publicly uploaded artworks cannot be updated via this route.
    if (!artwork.artist && artwork.isPublic) {
      return res.status(403).json({ message: 'Publicly uploaded artworks cannot be updated via this route.' });
    }
    
    const { title, description, category, tags, isPublic } = req.body;
    
    artwork.title = title || artwork.title;
    artwork.description = description || artwork.description;
    artwork.category = category || artwork.category;
    artwork.tags = tags || artwork.tags;
    artwork.isPublic = isPublic !== undefined ? isPublic : artwork.isPublic;
    
    await artwork.save();
    
    const updatedArtwork = await Artwork.findById(artwork._id)
      .populate('artist', 'username avatar');
    
    res.json({
      message: 'Artwork updated successfully',
      artwork: updatedArtwork
    });
  } catch (error) {
    console.error('Update artwork error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete artwork (protected route)
router.delete('/:id', auth, async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // If artwork has an associated artist, check ownership
    if (artwork.artist) {
      const artist = await Artist.findOne({ user: req.user.userId });
      if (!artist || artwork.artist.toString() !== artist._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      // Remove artwork from artist's portfolio
      artist.portfolio = artist.portfolio.filter(aid => aid.toString() !== artwork._id.toString());
      await artist.save();
    } else if (artwork.isPublic) {
      // For public uploads, only an admin or specific role should be able to delete.
      // For now, only authenticated artists can delete their own artwork.
      // Publicly uploaded artworks cannot be deleted via this route by regular users.
      return res.status(403).json({ message: 'Publicly uploaded artworks cannot be deleted via this route by regular users.' });
    }

    await Artwork.findByIdAndDelete(req.params.id);
    res.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    console.error('Delete artwork error:', error);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// Like/unlike artwork (protected route)
router.post('/:id/like', auth, async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    const likeIndex = artwork.likes.indexOf(req.user.userId);
    
    if (likeIndex > -1) {
      // Unlike
      artwork.likes.splice(likeIndex, 1);
    } else {
      // Like
      artwork.likes.push(req.user.userId);
    }
    
    await artwork.save();
    
    res.json({
      message: likeIndex > -1 ? 'Artwork unliked' : 'Artwork liked',
      likes: artwork.likes.length
    });
  } catch (error) {
    console.error('Like artwork error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's artworks (protected route)
router.get('/user/me', auth, async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.user.userId })
      .populate('artist', 'username avatar')
      .sort({ createdAt: -1 });
    
    res.json(artworks);
  } catch (error) {
    console.error('Get user artworks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear all artworks (protected route)
router.delete('/clear-all', auth, async (req, res) => {
  try {
    // Delete all artworks
    await Artwork.deleteMany({});

    // Clear all portfolios
    await Artist.updateMany({}, { $set: { portfolio: [] } });

    res.json({ message: 'All artworks cleared successfully' });
  } catch (error) {
    console.error('Clear all artworks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;