import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
// import './UploadArtwork.css'; // Remove this import


const PublicUploadArtwork = ({ onClose }) => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [artwork, setArtwork] = useState({
    title: '',
    description: '',
    category: '',
    image: null,
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleArtworkChange = (e) => {
    if (e.target.name === 'image') {
      setArtwork({ ...artwork, image: e.target.files[0] });
    } else {
      setArtwork({ ...artwork, [e.target.name]: e.target.value });
    }
  };

  const handleUploadArtwork = async (e) => {
    e.preventDefault();
    if (!artwork.title || !artwork.image || !artwork.category) {
      setError('Artwork needs a title, category, and an image.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', artwork.title);
      formData.append('description', artwork.description);
      formData.append('category', artwork.category);
      formData.append('image', artwork.image);

      await axios.post(`http://localhost:5000/api/artwork/public-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage('Artwork uploaded successfully! It will appear in the gallery after review.');
      setArtwork({
        title: '',
        description: '',
        category: '',
        image: null,
      });
      setTimeout(() => {
        setSuccessMessage('');
        if (onClose) onClose(); // Close modal if used as one
        navigate('/gallery', { state: { artworkUploaded: true } }); // Navigate back to gallery with state
      }, 2400);
    } catch (err) {
      setError('Failed to upload artwork. Please try again.');
      console.error(err);
    }
    setUploading(false);
  };

  return (
    <div className="modal-overlay"> {/* Changed class */}
      <div className="modal-content card"> {/* Changed class */}
        {onClose && <button className="modal-close" onClick={onClose}>&times;</button>} {/* Changed to button with modal-close */}
        <h2>Upload Artwork to Gallery</h2>
        {successMessage && <div className="alert alert-success">{successMessage}</div>} {/* Changed class */}
        {error && <div className="alert alert-error">{error}</div>} {/* Changed class */}
        <form onSubmit={handleUploadArtwork}>
          <div className="form-group">
            <label className="form-label">Title</label> {/* Added form-label */}
            <input
              type="text"
              name="title"
              value={artwork.title}
              onChange={handleArtworkChange}
              className="input" // Added input class
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label> {/* Added form-label */}
            <textarea
              name="description"
              value={artwork.description}
              onChange={handleArtworkChange}
              className="input" // Added input class
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label> {/* Added form-label */}
            <select
              name="category"
              value={artwork.category}
              onChange={handleArtworkChange}
              className="input" // Added input class
            >
              <option value="" disabled>Select a category</option>
              <option value="Digital Art">Digital Art</option>
              <option value="Traditional Art">Traditional Art</option>
              <option value="Photography">Photography</option>
              <option value="Sculpture">Sculpture</option>
              <option value="Mixed Media">Mixed Media</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Image</label> {/* Added form-label */}
            <input
              type="file"
              name="image"
              onChange={handleArtworkChange}
              accept="image/*"
              className="input" // Added input class
            />
          </div>
          <button type="submit" disabled={uploading} className="btn btn-primary"> {/* Added btn btn-primary */}
            {uploading ? 'Uploading...' : 'Upload to Gallery'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicUploadArtwork;
