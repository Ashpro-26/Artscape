import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const WeeklyChallenge = () => {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await fetch('/api/challenge/weekly');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setChallenge(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, []);

  const handleViewSubmissions = () => {
    if (challenge && challenge._id) {
      navigate(`/challenge/${challenge._id}/submissions`);
    }
  };

  if (loading) {
    return <div className="loading">Loading weekly challenge...</div>;
  }

  if (error) {
    return <div className="alert alert-error">Error: {error}</div>;
  }

  if (!challenge || !challenge.title) {
    return <div className="card">No weekly challenge available at the moment.</div>;
  }

  const isSubmissionsOpen = (challenge?.isSubmissionsOpen ?? false) && new Date(challenge?.submissionEndDate ?? 0) > new Date();

  return (
    <div className="weekly-challenge-container card">
      <h2>Weekly Art Challenge</h2>
      <h3>{challenge.title} ({challenge.category})</h3>
      <p>{challenge.description}</p>
      <div className="challenge-actions">
        {isSubmissionsOpen ? (
          <p>Submissions are currently open!</p>
        ) : (
          <p>Submissions are currently closed.</p>
        )}
        <button
          className="btn btn-primary"
          onClick={handleViewSubmissions}
          disabled={!isSubmissionsOpen}
        >
          View Submissions
        </button>
      </div>
    </div>
  );
};

export default WeeklyChallenge;
