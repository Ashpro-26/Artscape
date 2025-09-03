import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import Link for nav-brand
import axios from 'axios';


const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching user:', error);
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  

  

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading your creative space...</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1>Welcome back, {user?.username || 'ArtismyPassion'}! 👋</h1>
            <p>Ready to create something amazing? Explore the vibrant world of art and connect with fellow creators.</p>
            <div className="card mt-3">
              <div className="card-body">
                <h5 className="card-title">Your Creative Profile</h5>
                <p className="card-text"><strong>Username:</strong> {user?.username || 'ArtismyPassion'}</p>
                <p className="card-text"><strong>Email:</strong> {user?.email || 'ashutoshprakash263@gmail.com'}</p>
                <p className="card-text"><strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '21/08/2025'}</p>
              </div>
            </div>
          </div>
          <img 
            src={user && user.avatar ? `/uploads/${user.avatar}` : '/default-avatar.png'}
            alt="User Avatar"
            className="rounded-circle"
            style={{ width: '150px', height: '150px' }}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h5 className="card-title">🎨 Art Gallery</h5>
              <p className="card-text">Discover amazing artworks from talented artists around the world. Browse, search, and get inspired by diverse creative styles.</p>
              <button className="btn btn-outline-primary" onClick={() => navigate('/gallery')}>Explore Gallery</button>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h5 className="card-title">💬 Community Forum</h5>
              <p className="card-text">Connect with fellow artists, share ideas, discuss techniques, and build meaningful relationships in our vibrant community.</p>
              <button className="btn btn-outline-primary" onClick={() => navigate('/forum')}>Join Discussion</button>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h5 className="card-title">👤 Artist Profile</h5>
              <p className="card-text">Customize your artist profile, showcase your portfolio, and build your personal brand in the creative community.</p>
              <button className="btn btn-outline-primary" onClick={() => navigate(`/artists/${user?.artistId || 'create'}`)}>Go to Profile</button>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h5 className="card-title">🎨 Artist Catalogue</h5>
              <p className="card-text">Browse artists and their portfolios in one place. Discover new talent and explore creative works.</p>
              <button className="btn btn-outline-primary" onClick={() => navigate('/artist-catalogue')}>Explore Catalogue</button>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h5 className="card-title">🏆 Weekly Challenge</h5>
              <p className="card-text">Participate in our weekly art challenges, showcase your skills, and get feedback from the community.</p>
              <button className="btn btn-outline-primary" onClick={() => navigate('/weekly-challenge')}>Join Challenge</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;