import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ArtworkModal from './ArtworkModal';


const Gallery = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  

  const categories = ['All', 'Digital Art', 'Traditional Art', 'Photography', 'Sculpture', 'Mixed Media', 'Other'];

  // Only fetch on category change and page change, not on search input
  const fetchArtworks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12
      });

      if (category !== 'All') {
        params.append('category', category);
      }

      if (search) {
        params.append('search', search);
      }

      const response = await axios.get(`http://localhost:5000/api/artwork?${params}`);
      setArtworks(response.data.artworks);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (err) {
      setError('Failed to load artworks');
      console.error('Fetch artworks error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, category, search]);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  const handleLike = async (artworkId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to like artworks');
        return;
      }

      await axios.post(`http://localhost:5000/api/artwork/${artworkId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh artworks to update like count
      fetchArtworks();
    } catch (err) {
      setError('Failed to like artwork');
      console.error('Like artwork error:', err);
    }
  };

  const handleArtworkClick = (artwork) => {
    setSelectedArtwork(artwork);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedArtwork(null);
  };

  const handleModalLike = () => {
    // Refresh artworks after like in modal
    fetchArtworks();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArtworks();
  };

  

  const handleUpload = () => {
    // Removed token check as this is now for public upload
    navigate('/public-upload-artwork');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Artwork Gallery</h1>
        <div>
          <button onClick={handleUpload} className="btn btn-primary me-2">
            🎨 Upload Artwork
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-outline-secondary">
            📊 Dashboard
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <form onSubmit={handleSearch} className="d-flex">
            <input
              type="text"
              placeholder="Search artworks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control me-2"
            />
            <button type="submit" className="btn btn-primary">
              🔍
            </button>
          </form>
        </div>
        <div className="col-md-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : artworks.length === 0 ? (
        <div className="card text-center p-4">
          <p>No artworks found. Be the first to upload!</p>
          <button onClick={handleUpload} className="btn btn-primary">
            Upload Your First Artwork
          </button>
        </div>
      ) : (
        <>
          <div className="row">
            {artworks.map(artwork => (
              <div key={artwork._id} className="col-md-4 mb-4">
                <div className="card h-100" onClick={() => handleArtworkClick(artwork)}>
                  <img src={`/uploads/${artwork.imageUrl}`} alt={artwork.title} className="card-img-top" />
                  <div className="card-body">
                    <h5 className="card-title">{artwork.title}</h5>
                    <p className="card-text">by {artwork.artist ? artwork.artist.username : artwork.guestArtistName ? artwork.guestArtistName : "Unknown"}</p>
                    <p className="card-text">{artwork.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-primary">{artwork.category}</span>
                      <small className="text-muted">{artwork.views} views</small>
                      <small className="text-muted">{artwork.likes.length} likes</small>
                    </div>
                  </div>
                  <div className="card-footer">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(artwork._id);
                      }}
                      className="btn btn-outline-danger"
                    >
                      ❤️ Like
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
                    Previous
                  </button>
                </li>
                <li className="page-item">
                  <span className="page-link">
                    Page {currentPage} of {totalPages}
                  </span>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      <ArtworkModal
        artwork={selectedArtwork}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onLike={handleModalLike}
      />
    </div>
  );
};

export default Gallery;
