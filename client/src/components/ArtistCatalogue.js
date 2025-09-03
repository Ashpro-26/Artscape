import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


const ArtistCatalogue = () => {
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

  return (
    <div className="container mt-4">
      <h1>Artist Catalogue</h1>
      {error && <p className="alert alert-error">{error}</p>}
      <div className="row">
        {artists.map((artist) => (
          <div key={artist._id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h2 className="card-title">{artist.name}</h2>
                <p className="card-text">{artist.bio}</p>
                <Link to={`/artists/${artist._id}`} state={{ from: 'catalogue' }} className="btn btn-primary">
                  View Profile
                </Link>
                {artist.contactInformation && (
                  <div className="mt-3">
                    {artist.contactInformation.email && <p>Email: {artist.contactInformation.email}</p>}
                    {artist.contactInformation.phone && <p>Phone: {artist.contactInformation.phone}</p>}
                    {artist.contactInformation.website && (
                      <p>
                        Website: <a href={artist.contactInformation.website} target="_blank" rel="noopener noreferrer">{artist.contactInformation.website}</a>
                      </p>
                    )}
                  </div>
                )}
                <h3 className="mt-4">Portfolio</h3>
                <div className="portfolio-grid">
                  {artist.portfolio && artist.portfolio.length > 0 ? (
                    artist.portfolio.map((artwork) => (
                      <div key={artwork._id} className="card">
                        <Link to={`/portfolio/${artwork._id}`}>
                          <img
                            src={artwork.imageUrl ? `/uploads/${artwork.imageUrl}` : '/default-art.png'}
                            alt={artwork.title}
                            className="card-img-top"
                          />
                          <div className="card-body">
                            <h5 className="card-title">{artwork.title}</h5>
                          </div>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p>No artwork in this portfolio yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistCatalogue;
