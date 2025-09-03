const express = require('express');
const jwt = require('jsonwebtoken');
const ForumPost = require('../models/ForumPost');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get all forum posts with optional filtering
router.get('/posts', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20, sort = 'newest' } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { tags: searchRegex }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'mostLiked':
        sortOption = { 'likes.length': -1 };
        break;
      case 'mostViewed':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const posts = await ForumPost.find(query)
      .populate('author', 'username avatar')
      .populate('comments.author', 'username avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Return just the posts array for the frontend
    res.json(posts);
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single forum post by ID
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'username avatar bio')
      .populate('comments.author', 'username avatar')
      .populate('likes', 'username');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Increment views
    post.views += 1;
    await post.save();
    
    res.json(post);
  } catch (error) {
    console.error('Get forum post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new forum post (protected route)
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    const post = new ForumPost({
      title,
      content,
      category,
      tags: tags || [],
      author: req.user.userId
    });
    
    await post.save();
    
    const populatedPost = await ForumPost.findById(post._id)
      .populate('author', 'username avatar');
    
    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost
    });
  } catch (error) {
    console.error('Create forum post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update forum post (protected route)
router.put('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { title, content, category, tags } = req.body;
    
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;
    
    await post.save();
    
    const updatedPost = await ForumPost.findById(post._id)
      .populate('author', 'username avatar');
    
    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update forum post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete forum post (protected route)
router.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await ForumPost.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete forum post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike forum post (protected route)
router.post('/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const likeIndex = post.likes.indexOf(req.user.userId);
    
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user.userId);
    }
    
    await post.save();
    
    res.json({
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      likes: post.likes.length
    });
  } catch (error) {
    console.error('Like forum post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to forum post (protected route)
router.post('/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.isLocked) {
      return res.status(403).json({ message: 'Post is locked' });
    }
    
    post.comments.push({
      author: req.user.userId,
      content
    });
    
    await post.save();
    
    const updatedPost = await ForumPost.findById(post._id)
      .populate('author', 'username avatar')
      .populate('comments.author', 'username avatar');
    
    res.json({
      message: 'Comment added successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike comment (protected route)
router.post('/posts/:postId/comments/:commentId/like', authenticateToken, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comment = post.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const likeIndex = comment.likes.indexOf(req.user.userId);
    
    if (likeIndex > -1) {
      // Unlike
      comment.likes.splice(likeIndex, 1);
    } else {
      // Like
      comment.likes.push(req.user.userId);
    }
    
    await post.save();
    
    res.json({
      message: likeIndex > -1 ? 'Comment unliked' : 'Comment liked',
      likes: comment.likes.length
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment (protected route)
router.delete('/posts/:postId/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comment = post.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (comment.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    comment.remove();
    await post.save();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get forum statistics
router.get('/stats', async (req, res) => {
  try {
    const totalPosts = await ForumPost.countDocuments();
    const totalComments = await ForumPost.aggregate([
      { $group: { _id: null, total: { $sum: { $size: '$comments' } } } }
    ]);
    const totalLikes = await ForumPost.aggregate([
      { $group: { _id: null, total: { $sum: { $size: '$likes' } } } }
    ]);
    
    res.json({
      totalPosts,
      totalComments: totalComments[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0
    });
  } catch (error) {
    console.error('Get forum stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 