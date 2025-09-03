import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PortfolioDetailView = () => {
  const { artworkId } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCurrentUser(response.data);
        }
      } catch {
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!artworkId) return;
    const fetchArtwork = async () => {
      try {
        const res = await axios.get(`/api/artwork/${artworkId}`);
        setArtwork(res.data);
        setError(null);
      } catch (err) {
        setError('Artwork not found.');
      }
    };
    fetchArtwork();
  }, [artworkId]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/artwork/${artworkId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(-1);
    } catch (err) {
      setError('Failed to delete artwork.');
    }
    setDeleting(false);
  };

  if (error) {
    return <div className="container"><div className="alert alert-error">{error}</div></div>;
  }
  if (!artwork) {
    return <div className="loading">Loading artwork...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="section-title">{artwork.title}</h1>
        <div style={{display:'flex',gap:32,alignItems:'flex-start',flexWrap:'wrap'}}>
          <img src={artwork.imageUrl ? `/uploads/${artwork.imageUrl}` : '/default-art.png'} alt={artwork.title} className="artwork-image-detail" />
          <div style={{flex:1,minWidth:220}}>
            <p>{artwork.description}</p>
            <p><b>Category:</b> {artwork.category || 'N/A'}</p>
            <p><b>Views:</b> {artwork.views || 0}</p>
            <p><b>Artist:</b> {artwork.artist?.user?.username || 'Unknown'}</p>
            {currentUser && artwork.artist && (artwork.artist._id === currentUser._id) && (
              <button onClick={handleDelete} disabled={deleting} className="btn btn-danger">
                {deleting ? 'Deleting...' : 'Delete Artwork'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetailView;
