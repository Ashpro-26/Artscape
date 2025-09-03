import React from 'react';
import axios from 'axios';


const ArtworkModal = ({ artwork, isOpen, onClose, onLike }) => {
  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to like artworks');
        return;
      }

      await axios.post(`http://localhost:5000/api/artwork/${artwork._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Call the parent's onLike function to update the gallery
      if (onLike) {
        onLike();
      }
    } catch (err) {
      console.error('Like artwork error:', err);
    }
  };

  if (!isOpen || !artwork) return null;

  // Determine artist name based on whether it's a registered artist or a guest upload
  const artistName = artwork.artist
    ? artwork.artist.username // For registered artists
    : artwork.guestArtistName // For guest uploads
      ? artwork.guestArtistName
      : "Unknown"; // Fallback if neither is present

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="modal-body">
          <div className="artwork-image-large">
            <img src={`/uploads/${artwork.imageUrl}`} alt={artwork.title} /> {/* FIX HERE */}
          </div>
          
          <div className="artwork-details">
            <h2>{artwork.title}</h2>
            {/* Updated line to display artist name */}
            <p className="artist-name">by {artistName}</p>
            
            {artwork.description && (
              <div className="artwork-description">
                <h3>Description</h3>
                <p>{artwork.description}</p>
              </div>
            )}
            
            <div className="artwork-meta-details">
              <div className="meta-item">
                <span className="label">Category:</span>
                <span className="value">{artwork.category}</span>
              </div>
              
              {artwork.tags && artwork.tags.length > 0 && (
                <div className="meta-item">
                  <span className="label">Tags:</span>
                  <div className="tags">
                    {artwork.tags.map((tag, index) => (
                      <span key={index} className="badge badge-primary">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="meta-item">
                <span className="label">Views:</span>
                <span className="value">{artwork.views}</span>
              </div>
              
              <div className="meta-item">
                <span className="label">Likes:</span>
                <span className="value">{artwork.likes.length}</span>
              </div>
              
              <div className="meta-item">
                <span className="label">Uploaded:</span>
                <span className="value">
                  {new Date(artwork.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="artwork-actions">
              <button onClick={handleLike} className="btn btn-danger">
                ❤️ Like ({artwork.likes.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkModal;