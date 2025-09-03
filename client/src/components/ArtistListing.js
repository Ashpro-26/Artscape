import React, { useState, useEffect } from 'react';
import axios from 'axios';


const ArtistListing = () => {
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/artists');
        setArtists(response.data);
      } catch (err) {
        setError('Failed to fetch artists. Please try again later.');
      }
    };

    fetchArtists();
  }, []);

  const handleViewProfile = (artist) => {
    // Disable navigation for Artist Profile, show alert or do nothing
    alert('Artist Profile coming soon!');
    // Or simply do nothing to disable navigation
    // return;
  };

  return (
    <div className="container section">
      <h1>Artist Portfolios</h1>
      {error && <p className="alert alert-error">{error}</p>}
      <div className="grid">
        {artists.map((artist) => (
          <div key={artist._id} className="card">
            <h2>{artist.name}</h2>
            <p>{artist.bio}</p>
            <button onClick={() => handleViewProfile(artist)} className="btn btn-primary">View Portfolio</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistListing;
