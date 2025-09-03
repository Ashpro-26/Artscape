import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import UploadArtwork from "./UploadArtwork";
import './ArtistProfile.css';

const ArtistProfile = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null); // To check ownership
  const [deleting, setDeleting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fromCatalogue = location.state?.from === 'catalogue';

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedUserId = storedUser ? storedUser._id : null;
    setUserId(storedUserId);

    const fetchArtist = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/artists/${artistId}?populate=user`);
        setArtist(response.data);
        setError("");
      } catch (err) {
        setError("Failed to load artist profile.");
      }
      setLoading(false);
    };

    if (artistId) {
      fetchArtist();
    } else {
      setError("No artist ID provided.");
      setLoading(false);
    }

    // Re-fetch artist data if updated state is passed from navigation
    if (location.state?.updated) {
      fetchArtist();
    }

  }, [artistId, location.state]); // Added location.state to dependency array

  const handleRemoveAvatar = async () => {
    if (!window.confirm("Are you sure you want to remove your avatar?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/artists/avatar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArtist((prev) => ({
        ...prev,
        user: { ...prev.user, avatar: null },
      }));
    } catch (err) {
      setError("Failed to remove avatar.");
    }
  };

  const handleDelete = async (artworkId) => {
    if (!window.confirm("Are you sure you want to delete this artwork?")) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/artwork/${artworkId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArtist((prev) => ({
        ...prev,
        portfolio: prev.portfolio.filter((artwork) => artwork._id !== artworkId),
      }));
    } catch (err) {
      setError("Failed to delete artwork.");
    }
    setDeleting(false);
  };

  if (loading) {
    return <div className="loading">Loading artist profile...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!artist) {
    return <div className="card">Artist not found.</div>;
  }

  const isOwner = userId && artist.user?._id && userId === artist.user._id?.toString();
  const canEdit = isOwner && !fromCatalogue;

  return (
    <div className="artist-profile-container card">
      <div className="artist-profile-header">
        <div>
          <h1>{artist.name}</h1>
          {canEdit && (
            <div className="artist-profile-actions">
              <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
                Upload Artwork
              </button>
              <button onClick={() => navigate(`/artists/${artist._id}/edit`)} className="btn btn-primary">
                Edit Profile
              </button>
              <button onClick={handleRemoveAvatar} className="btn btn-danger">
                Remove Avatar
              </button>
            </div>
          )}
        </div>
        <img
          src={artist.user && artist.user.avatar ? `/uploads/${artist.user.avatar}?t=${new Date().getTime()}` : '/default-avatar.png'}
          alt={`${artist.name}'s avatar`}
          className="artist-profile-avatar"
        />
      </div>
      <p className="artist-profile-bio">{artist.bio}</p>

      <div className="artist-profile-section">
        <h3>Contact Information</h3>
        {artist.contactInformation ? (
          <ul className="contact-info-list">
            {artist.contactInformation.email && <li>Email: <a href={`mailto:${artist.contactInformation.email}`}>{artist.contactInformation.email}</a></li>}
            {artist.contactInformation.phone && <li>Phone: <span>{artist.contactInformation.phone}</span></li>}
            {artist.contactInformation.website && <li>Website: <a href={artist.contactInformation.website} target="_blank" rel="noopener noreferrer">{artist.contactInformation.website}</a></li>}
          </ul>
        ) : (
          <p>No contact information provided.</p>
        )}
      </div>

      <div className="artist-profile-section">
        <h3>Service Charges</h3>
        <p>{artist.serviceCharges || "Not specified"}</p>
      </div>

      <div>
        <h3>Portfolio</h3>
        {artist.portfolio && artist.portfolio.length > 0 ? (
          <div className="portfolio-grid">
            {artist.portfolio.map((artwork) => (
              <div key={artwork._id} className="card" onClick={() => navigate(`/portfolio/${artwork._id}`)}>
                <img src={artwork.imageUrl ? `/uploads/${artwork.imageUrl}` : "/default-art.png"} alt={artwork.title} className="portfolio-item-image" />
                <div className="portfolio-item-title">
                  <h5>{artwork.title}</h5>
                </div>
                {isOwner && (
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(artwork._id); }} disabled={deleting} className="btn btn-danger">
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No artwork in portfolio yet.</p>
        )}
      </div>
      {showUploadModal && <UploadArtwork artistId={artistId} onClose={() => setShowUploadModal(false)} />}
    </div>
  );
};

export default ArtistProfile;