import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
 

const Forum = () => {
  
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const forumCategories = [
    { id: 'all', name: 'All Discussions', icon: '💬', color: '#667eea' },
    { id: 'techniques', name: 'Art Techniques', icon: '🎨', color: '#ff6b6b' },
    { id: 'inspiration', name: 'Inspiration & Ideas', icon: '💡', color: '#4ecdc4' },
    { id: 'critique', name: 'Art Critique', icon: '🔍', color: '#45b7d1' },
    { id: 'tools', name: 'Tools & Software', icon: '🛠️', color: '#96ceb4' },
    { id: 'collaboration', name: 'Collaboration', icon: '🤝', color: '#feca57' },
    { id: 'business', name: 'Art Business', icon: '💰', color: '#ff9ff3' },
    { id: 'general', name: 'General Chat', icon: '💭', color: '#54a0ff' }
  ];

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(response.data);
      }
    } catch (err) {
      console.error('Fetch user error:', err);
      // Don't set error for user fetch as it's optional
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await axios.get(`http://localhost:5000/api/forum/posts?${params}`);
      
      // Handle the response structure correctly
      if (Array.isArray(response.data)) {
        setPosts(response.data);
      } else {
        setPosts([]);
      }
      setError('');
    } catch (err) {
      setError('Failed to load forum posts');
      console.error('Fetch posts error:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, [fetchUser, fetchPosts]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to create a post');
        return;
      }

      const postData = {
        ...newPost,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await axios.post('http://localhost:5000/api/forum/posts', postData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewPost({ title: '', content: '', category: '', tags: '' });
      setShowCreatePost(false);
      fetchPosts();
    } catch (err) {
      setError('Failed to create post');
      console.error('Create post error:', err);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to like posts');
        return;
      }

      await axios.post(`http://localhost:5000/api/forum/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchPosts();
    } catch (err) {
      setError('Failed to like post');
      console.error('Like post error:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/forum/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchPosts();
    } catch (err) {
      setError('Failed to delete post');
      console.error('Delete post error:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Categories</h5>
              <div className="list-group">
                {forumCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`list-group-item list-group-item-action category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                    style={{ borderLeftColor: category.color }}
                  >
                    <span className="me-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>🎨 Artist Community Forum</h1>
            <div>
              <button onClick={() => setShowCreatePost(true)} className="btn btn-primary me-2">
                ✨ Start a Discussion
              </button>
              <button onClick={() => navigate('/gallery')} className="btn btn-outline-secondary">
                🖼️ Gallery
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {showCreatePost && (
            <div className="modal show d-block" tabIndex="-1">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Start a Discussion</h5>
                    <button type="button" className="btn-close" onClick={() => setShowCreatePost(false)}></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleCreatePost}>
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">Title</label>
                        <input
                          type="text"
                          id="title"
                          className="form-control"
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                          placeholder="What's your discussion about?"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="category" className="form-label">Category</label>
                        <select
                          id="category"
                          className="form-select"
                          value={newPost.category}
                          onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                          required
                        >
                          <option value="">Select a category</option>
                          {forumCategories.slice(1).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="content" className="form-label">Content</label>
                        <textarea
                          id="content"
                          className="form-control"
                          value={newPost.content}
                          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                          placeholder="Share your thoughts, questions, or ideas..."
                          rows="6"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="tags" className="form-label">Tags (comma-separated)</label>
                        <input
                          type="text"
                          id="tags"
                          className="form-control"
                          value={newPost.tags}
                          onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                          placeholder="art, technique, inspiration"
                        />
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowCreatePost(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Post Discussion</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="card text-center p-4">
              <h3>No discussions yet</h3>
              <p>Be the first to start a conversation in this category!</p>
              <button onClick={() => setShowCreatePost(true)} className="btn btn-primary">
                Start the First Discussion
              </button>
            </div>
          ) : (
            posts.map(post => (
              <div key={post._id} className="card mb-3 card-lift">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div className="d-flex align-items-center">
                      <img
                        src={post.author?.avatar || '/default-avatar.png'}
                        alt={post.author?.username || 'User'}
                        className="rounded-circle me-2"
                        width="40"
                        height="40"
                      />
                      <div>
                        <h5 className="mb-0">{post.author?.username || 'Anonymous'}</h5>
                        <small className="text-muted">{formatDate(post.createdAt)}</small>
                      </div>
                    </div>
                    {currentUser && post.author?._id === currentUser._id && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <h4 className="card-title mt-3">{post.title}</h4>
                  <p className="card-text">{post.content}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div>
                      {post.tags.map((tag, index) => (
                        <span key={index} className="badge bg-primary me-1">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center">
                  <div>
                    <button
                      onClick={() => handleLikePost(post._id)}
                      className={`btn btn-sm ${post.likes?.includes(currentUser?._id) ? 'btn-danger' : 'btn-outline-danger'}`}
                    >
                      ❤️ {post.likes?.length || 0}
                    </button>
                    <span className="ms-2">💬 {post.comments?.length || 0}</span>
                  </div>
                  <div>
                    <span className="badge bg-secondary">{forumCategories.find(cat => cat.id === post.category)?.name}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;
