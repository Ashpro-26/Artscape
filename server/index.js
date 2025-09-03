require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');

const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require('./db');

// Import Passport configuration
require('./config/passport-setup');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// Set up session
app.use(session({
  secret: 'your_secret_key', // Replace with a secure key
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/artwork', require('./routes/artwork'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/artists', require('./routes/artist'));
app.use('/api/challenge', require('./routes/challenge'));
app.use('/api/submissions', require('./routes/submission'));

app.get('/', (req, res) => {
  res.send('Welcome to the Artist Community Platform API!');
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});