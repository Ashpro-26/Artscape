const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Comment = require('../models/Comment'); // Import Comment model
const auth = require('../middleware/auth');

// --- Multer setup (existing code) ---
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
// --- End Multer setup ---

// GET all submissions for a specific challenge (existing code)
router.get('/:challengeId', async (req, res) => {
  try {
    const submissions = await Submission.find({ challengeId: req.params.challengeId }).populate('userId', 'username');
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST a new submission (existing code)
router.post('/', auth, upload.single('artworkImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No image file provided for submission' });
    }

    const { challengeId, title, description } = req.body;
    const userId = req.user.id;
    const artworkUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    if (!challengeId || !title) {
      return res.status(400).json({ msg: 'Please provide challengeId and title for the submission' });
    }

    const newSubmission = new Submission({
      challengeId,
      userId,
      artworkUrl,
      title,
      description,
    });

    await newSubmission.save();
    res.status(201).json(newSubmission);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST to like/unlike a submission (existing code)
router.post('/:id/like', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }

    if (submission.likes.includes(req.user.id)) {
      submission.likes = submission.likes.filter(
        (like) => like.toString() !== req.user.id.toString()
      );
      await submission.save();
      return res.json({ msg: 'Submission unliked', likes: submission.likes.length });
    } else {
      submission.likes.unshift(req.user.id);
      await submission.save();
      return res.json({ msg: 'Submission liked', likes: submission.likes.length });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET all comments for a specific submission
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ submissionId: req.params.id }).populate('userId', 'username');
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST a new comment for a specific submission
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const submissionId = req.params.id;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ msg: 'Comment text is required' });
    }

    const newComment = new Comment({
      submissionId,
      userId,
      text,
    });

    await newComment.save();
    res.status(201).json(newComment);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Error handling middleware for multer (existing code)
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }
  res.status(400).json({ message: error.message });
});

module.exports = router;