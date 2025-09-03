const mongoose = require('mongoose');

const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      bio,
      contactInformation
    } = req.body;

    console.log('Artist creation request body:', req.body);
    console.log('Authenticated user:', req.user);

    if (!req.user || !req.user.userId) {
      console.error('User ID is missing from the token.');
      return res.status(400).send('User ID is missing from the token.');
    }

    let userId;
    try {
      userId = new mongoose.Types.ObjectId(req.user.userId);
    } catch (err) {
      console.error('Invalid User ID:', req.user.userId);
      return res.status(400).send('Invalid User ID.');
    }

    const artist = new Artist({
      name,
      bio,
      contactInformation,
      user: userId
    });

    await artist.save();
    console.log('Artist saved:', artist);

    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for artist creation:', userId);
      return res.status(500).send('User not found for artist creation');
    }
    user.isArtist = true;
    await user.save();
    console.log('User updated to isArtist:', user);

    res.status(201).json(artist);
  } catch (err) {
    console.error('Artist creation error:', err);
    console.error('Error details:', err.stack);
    res.status(500).json({
      message: 'Server Error',
      error: err.message,
      stack: err.stack
    });
  }
});

router.put('/:artistId', auth, upload.single('avatar'), async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.artistId);

    if (!artist) {
      return res.status(404).json({
        msg: 'Artist not found'
      });
    }

    if (artist.user.toString() !== req.user.userId) {
      return res.status(401).json({
        msg: 'Not authorized'
      });
    }

    // Update fields from req.body
    artist.name = req.body.name || artist.name;
    artist.bio = req.body.bio || artist.bio;
    artist.serviceCharges = req.body.serviceCharges;

    // Reconstruct contactInformation
    artist.contactInformation = {
      email: req.body['contactInformation[email]'] || artist.contactInformation.email,
      phone: req.body['contactInformation[phone]'] || artist.contactInformation.phone,
      website: req.body['contactInformation[website]'] || artist.contactInformation.website,
    };

    // Handle avatar upload
    if (req.file) {
      const user = await User.findById(req.user.userId);
      if (user) {
        user.avatar = req.file.filename;
        await user.save();
      }
    }

    await artist.save();
    res.json(artist);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        msg: 'Artist not found'
      });
    }
    res.status(500).send('Server Error');
  }
});

router.get('/:artistId', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.artistId)
      .populate('portfolio')
      .populate('user');

    if (!artist) {
      return res.status(404).json({
        msg: 'Artist not found'
      });
    }

    res.json(artist);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        msg: 'Artist not found'
      });
    }
    res.status(500).send('Server Error');
  }
});

router.delete('/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.avatar = null;
    await user.save();

    res.json({ msg: 'Avatar removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:artistId', auth, async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.artistId);

    if (!artist) {
      return res.status(404).json({
        msg: 'Artist not found'
      });
    }

    if (artist.user.toString() !== req.user.userId) {
      return res.status(401).json({
        msg: 'Not authorized'
      });
    }

    await artist.remove();
    res.json({
      msg: 'Artist deleted'
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        msg: 'Artist not found'
      });
    }
    res.status(500).send('Server Error');
  }
});



router.get('/', async (req, res) => {
  try {
    const artists = await Artist.find({ portfolio: { $exists: true, $not: { $size: 0 } } }).select('-user').populate('portfolio');
    res.json(artists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ message: 'Failed to fetch artists' });
  }
});

module.exports = router;