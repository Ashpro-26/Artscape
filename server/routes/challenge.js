const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');

// Helper function to get the ISO week number
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}

// GET current weekly challenge
router.get('/weekly', async (req, res) => {
  try {
    const today = new Date();
    const currentWeek = getWeekNumber(today);
    const currentYear = today.getFullYear();

    const challenge = await Challenge.findOne({ week: currentWeek, year: currentYear });

    if (challenge) {
      res.status(200).json(challenge);
    } else {
      res.status(404).json({ message: 'No weekly challenge found for the current week.' });
    }
  } catch (error) {
    console.error('Error fetching weekly challenge:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all challenges (temporary route for debugging)
router.get('/all', async (req, res) => {
  try {
    const challenges = await Challenge.find({});
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching all challenges:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET challenge by ID
router.get('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Challenge not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;