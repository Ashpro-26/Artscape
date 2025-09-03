const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User'); // Assuming you have a User model
const Artist = require('../models/Artist');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../config/email');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});


router.post('/login', (req, res, next) => {
  
  passport.authenticate('local', { session: false }, (err, user, info) => {
    
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({
        message: 'Server error during authentication',
        error: err.message
      });
    }
    
    if (!user) {
      return res.status(400).json({
        message: info ? info.message : 'Login failed',
        user: user,
      });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({
          message: 'Server error during login',
          error: err.message
        });
      }

      const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here', { expiresIn: '1h' });
      return res.json({ user, token });
    });
  })(req, res, next);
});

// Register route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user route
router.get('/me', auth, async (req, res) => {
  try {
    // The auth middleware already decodes the token and attaches user to req
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let artistId = null;
    if (user.isArtist) {
      const artist = await Artist.findOne({ user: user._id });
      if (artist) {
        artistId = artist._id;
      }
    }

    res.json({
      ...user.toObject(),
      artistId: artistId
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a simple reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create reset link
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetLink, user.username);
    
    if (emailResult.success) {
      console.log('Password reset email sent successfully to:', email);
      res.json({ 
        message: 'Password reset link sent to your email',
        resetLink: resetLink // Keep for development, remove in production
      });
    } else {
      console.error('Failed to send email:', emailResult.error);
      // Still save the token but inform about email failure
      res.json({ 
        message: 'Password reset link generated but email delivery failed. Check console for link.',
        resetLink: resetLink,
        emailError: emailResult.error
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Avatar upload route
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.avatar = req.file.filename;
    await user.save();

    res.json({
      message: 'Avatar updated successfully.',
      avatar: user.avatar,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Server error during avatar upload.' });
  }
});

// Remove avatar route
router.delete('/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.avatar = '';
    await user.save();

    res.json({
      message: 'Avatar removed successfully.',
    });
  } catch (error) {
    console.error('Avatar removal error:', error);
    res.status(500).json({ message: 'Server error during avatar removal.' });
  }
});

module.exports = router;