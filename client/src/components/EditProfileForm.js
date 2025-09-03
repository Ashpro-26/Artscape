import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";


const EditProfileForm = () => {
  const { artistId } = useParams();
  const [artist, setArtist] = useState({
    name: "",
    bio: "",
    contactInformation: {
      email: "",
      phone: "",
      website: "",
    },
    serviceCharges: "",
    user: null,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!artistId || artistId === "null") {
      setExists(false);
      setLoading(false);
      return;
    }
    const fetchArtist = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/artists/${artistId}?populate=user`);
        setArtist(res.data);
        setExists(true);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setExists(false);
        } else {
          setError("Error loading artist profile.");
        }
      }
      setLoading(false);
    };

    fetchArtist();
  }, [artistId]);

  const handleChange = (e) => {
    if (e.target.name.startsWith("contactInformation.")) {
      const field = e.target.name.split(".")[1];
      setArtist((prev) => ({
        ...prev,
        contactInformation: {
          ...prev.contactInformation,
          [field]: e.target.value,
        },
      }));
    } else {
      setArtist((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleAvatarChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("You must be logged in to create or edit an artist profile.");
      return;
    }

    const formData = new FormData();
    formData.append("name", artist.name);
    formData.append("bio", artist.bio);
    formData.append("serviceCharges", artist.serviceCharges);
    formData.append("contactInformation[email]", artist.contactInformation.email);
    formData.append("contactInformation[phone]", artist.contactInformation.phone);
    formData.append("contactInformation[website]", artist.contactInformation.website);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    
    try {
      if (exists) {
        await axios.put(`/api/artists/${artistId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        navigate(`/artists/${artistId}`, { state: { updated: true } });
      } else {
        const response = await axios.post(`/api/artists`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data._id) {
          localStorage.setItem("artistId", response.data._id);
          window.history.replaceState(null, '', `/artists/${response.data._id}/edit`);
          navigate(`/artists/${response.data._id}`, { state: { updated: true } });
        }
      }
      setSuccessMessage("Profile saved! You can always update it.");
      setTimeout(() => setSuccessMessage(""), 2400);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to save artist profile. Please try again.");
      }
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile form...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="section-title">
          {exists ? "Edit Profile" : "Create Profile"}
        </h1>
        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input type="text" name="name" value={artist.name} onChange={handleChange} className="form-control" placeholder="Artist Name" />
            <label htmlFor="name">Artist Name:</label>
          </div>
          <div className="form-floating mb-3">
            <textarea name="bio" value={artist.bio} onChange={handleChange} rows={2} className="form-control" placeholder="Bio" />
            <label htmlFor="bio">Bio:</label>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <div className="form-floating">
                <input type="email" name="contactInformation.email" value={artist.contactInformation.email || ''} onChange={handleChange} className="form-control" placeholder="Email" />
                <label htmlFor="contactInformation.email">Email:</label>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-floating">
                <input type="text" name="contactInformation.phone" value={artist.contactInformation.phone || ''} onChange={handleChange} className="form-control" placeholder="Phone" />
                <label htmlFor="contactInformation.phone">Phone:</label>
              </div>
            </div>
          </div>
          <div className="form-floating mb-3">
            <input type="text" name="contactInformation.website" value={artist.contactInformation.website || ''} onChange={handleChange} className="form-control" placeholder="Website" />
            <label htmlFor="contactInformation.website">Website:</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="text"
              name="serviceCharges"
              value={artist.serviceCharges || ''}
              onChange={handleChange}
              placeholder="E.g. $200 per piece, Negotiable, Contact for pricing"
              className="form-control"
            />
            <label htmlFor="serviceCharges">Service Charges (optional):</label>
          </div>
          <div className="mb-3">
            <label htmlFor="avatar" className="form-label">Profile Picture:</label>
            <input type="file" name="avatar" accept="image/*" onChange={handleAvatarChange} className="form-control" id="avatar" />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {exists ? "Update Profile" : "Create Profile"}
          </button>
        </form>

        <div className="section-divider" style={{ borderTop: "1px solid #dbeafe", margin: "2.4rem 0 0" }} />
        <div style={{ fontSize: "1.13rem", color: "#455987", marginTop: "2.4rem", marginBottom: "1.7rem", textAlign: "center" }}>
          Share your profile and works with potential clients!
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;