import React, { useState } from 'react';
import axios from 'axios';

const UploadArtwork = ({ artistId, onClose }) => {
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

      const token = localStorage.getItem('token');
      await axios.post(`/api/artwork/portfolio/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage('Artwork uploaded! Refresh or view your featured portfolio below.');
      setArtwork({
        title: '',
        description: '',
        category: '',
        image: null,
      });
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2400);
    } catch (err) {
      setError('Failed to upload artwork.');
      console.error(err);
    }
    setUploading(false);
  };

  return (
    <div className="upload-artwork-modal">
      <div className="upload-artwork-content card">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Upload Artwork</h2>
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleUploadArtwork}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              value={artwork.title}
              onChange={handleArtworkChange}
              className="input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={artwork.description}
              onChange={handleArtworkChange}
              className="input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              value={artwork.category}
              onChange={handleArtworkChange}
              className="input"
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
            <label className="form-label">Image</label>
            <input
              type="file"
              name="image"
              onChange={handleArtworkChange}
              accept="image/*"
              className="input"
            />
          </div>
          <button type="submit" disabled={uploading} className="btn btn-primary">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadArtwork;
