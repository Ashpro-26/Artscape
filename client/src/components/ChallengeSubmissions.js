import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';


const ChallengeSubmissions = () => {
  const { challengeId } = useParams();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [challengeDetails, setChallengeDetails] = useState(null);

  const [submissionArtwork, setSubmissionArtwork] = useState({
    title: '',
    description: '',
    image: null,
  });
  const [uploading, setUploading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState('');

  // State to manage comments for each submission
  const [comments, setComments] = useState({});
  const [newCommentText, setNewCommentText] = useState({}); // { submissionId: 'text', ... }
  const [showComments, setShowComments] = useState({}); // { submissionId: true/false, ... }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const challengeResponse = await fetch('/api/challenge/weekly');
        if (!challengeResponse.ok) {
          throw new Error(`HTTP error! status: ${challengeResponse.status}`);
        }
        const challengeData = await challengeResponse.json();
        setChallengeDetails(challengeData);

        const submissionsResponse = await fetch(`/api/submissions/${challengeId}`);
        if (!submissionsResponse.ok) {
          throw new Error(`HTTP error! status: ${submissionsResponse.status}`);
        }
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData);

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [challengeId]);

  const handleSubmissionArtworkChange = (e) => {
    if (e.target.name === 'image') {
      setSubmissionArtwork({ ...submissionArtwork, image: e.target.files[0] });
    } else {
      setSubmissionArtwork({ ...submissionArtwork, [e.target.name]: e.target.value });
    }
  };

  const handleArtworkSubmission = async (e) => {
    e.preventDefault();
    setUploading(true);
    setSubmissionError('');
    setSubmissionSuccess('');

    if (!submissionArtwork.title || !submissionArtwork.image) {
      setSubmissionError('Title and image are required for submission.');
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('challengeId', challengeId);
      formData.append('title', submissionArtwork.title);
      formData.append('description', submissionArtwork.description);
      formData.append('artworkImage', submissionArtwork.image);

      // Assuming your backend is at http://localhost:5000
      await axios.post('http://localhost:5000/api/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmissionSuccess('Artwork submitted successfully!');
      setSubmissionArtwork({ title: '', description: '', image: null });
      const updatedSubmissionsResponse = await fetch(`/api/submissions/${challengeId}`);
      const updatedSubmissionsData = await updatedSubmissionsResponse.json();
      setSubmissions(updatedSubmissionsData);

    } catch (err) {
      console.error('Submission error:', err);
      setSubmissionError('Failed to submit artwork. Please try again.');
      if (err.response && err.response.data && err.response.data.msg) {
        setSubmissionError(err.response.data.msg);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (submissionId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/submissions/${submissionId}/like`);
      
      setSubmissions(submissions.map(sub => 
        sub._id === submissionId ? { ...sub, likes: response.data.likes } : sub
      ));
    } catch (err) {
      console.error('Like error:', err);
      // Handle error, e.g., show a message to the user
    }
  };

  const toggleComments = async (submissionId) => {
    setShowComments(prevState => ({
      ...prevState,
      [submissionId]: !prevState[submissionId]
    }));

    // Fetch comments only if they are not already loaded for this submission
    if (!comments[submissionId] && !showComments[submissionId]) {
      try {
        const response = await axios.get(`http://localhost:5000/api/submissions/${submissionId}/comments`);
        setComments(prevState => ({
          ...prevState,
          [submissionId]: response.data
        }));
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    }
  };

  const handleCommentChange = (submissionId, text) => {
    setNewCommentText(prevState => ({
      ...prevState,
      [submissionId]: text
    }));
  };

  const handleCommentSubmit = async (submissionId) => {
    if (!newCommentText[submissionId] || newCommentText[submissionId].trim() === '') {
      return; // Don't submit empty comments
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/submissions/${submissionId}/comments`, {
        text: newCommentText[submissionId]
      });

      // Add the new comment to the state
      setComments(prevState => ({
        ...prevState,
        [submissionId]: [...(prevState[submissionId] || []), response.data]
      }));
      setNewCommentText(prevState => ({
        ...prevState,
        [submissionId]: '' // Clear the input field
      }));
    } catch (err) {
      console.error('Error submitting comment:', err);
      // Handle error
    }
  };

  if (loading) {
    return <div className="loading">Loading submissions...</div>; {/* Changed class */}
  }

  if (error) {
    return <div className="alert alert-error">Error: {error}</div>; {/* Changed class */} 
  }

  const isSubmissionsOpen = (challengeDetails?.isSubmissionsOpen ?? false) && new Date(challengeDetails?.submissionEndDate ?? 0) > new Date();

  return (
    <div className="container section challenge-submissions-container"> {/* Added global 'container section' classes */} 
      <h2>Submissions for Challenge {challengeDetails?.title || challengeId}</h2>

      {isSubmissionsOpen ? (
        <div className="submission-form-section card"> {/* Added global 'card' class */} 
          <h3>Submit Your Artwork</h3>
          {submissionSuccess && <div className="alert alert-success">{submissionSuccess}</div>} {/* Changed class */} 
          {submissionError && <div className="alert alert-error">{submissionError}</div>} {/* Changed class */} 
          <form onSubmit={handleArtworkSubmission}>
            <div className="form-group">
              <label htmlFor="submissionTitle" className="form-label">Title:</label> {/* Added form-label */} 
              <input
                type="text"
                id="submissionTitle"
                name="title"
                value={submissionArtwork.title}
                onChange={handleSubmissionArtworkChange}
                required
                className="input" // Added input class
              />
            </div>
            <div className="form-group">
              <label htmlFor="submissionDescription" className="form-label">Description (Optional):</label> {/* Added form-label */} 
              <textarea
                id="submissionDescription"
                name="description"
                value={submissionArtwork.description}
                onChange={handleSubmissionArtworkChange}
                className="input" // Added input class
              />
            </div>
            <div className="form-group">
              <label htmlFor="submissionImage" className="form-label">Artwork Image:</label> {/* Added form-label */} 
              <input
                type="file"
                id="submissionImage"
                name="image"
                onChange={handleSubmissionArtworkChange}
                accept="image/*"
                required
                className="input" // Added input class
              />
            </div>
            <button type="submit" disabled={uploading} className="btn btn-primary"> {/* Added btn btn-primary */} 
              {uploading ? 'Submitting...' : 'Submit Artwork'}
            </button>
          </form>
        </div>
      ) : (
        <p className="submissions-closed-message alert alert-info">Submissions are currently closed for this challenge.</p>
      )}

      <h3 className="submissions-list-heading">All Submissions</h3>
      {submissions.length === 0 ? (
        <p>No submissions yet for this challenge.</p>
      ) : (
        <div className="submissions-grid grid grid-3"> {/* Added global 'grid grid-3' classes */} 
          {submissions.map((submission) => (
            <div key={submission._id} className="submission-item card"> {/* Added global 'card' class */} 
              <img src={submission.artworkUrl} alt={submission.title} className="submission-image" />
              <div className="submission-details">
                <h4>{submission.title}</h4>
                <p>by {submission.userId ? submission.userId.username : 'Unknown'}</p>
                {submission.description && <p className="submission-description">{submission.description}</p>}
                <div className="submission-actions">
                  <button className="like-button btn" onClick={() => handleLike(submission._id)}> {/* Added global 'btn' class */} 
                    ❤️ {submission.likes ? submission.likes.length : 0}
                  </button>
                  <button className="comment-toggle-button btn" onClick={() => toggleComments(submission._id)}> {/* Added global 'btn' class */} 
                    💬 Comments ({comments[submission._id] ? comments[submission._id].length : 0})
                  </button>
                </div>
              </div>

              {showComments[submission._id] && (
                <div className="comments-section">
                  <h5>Comments:</h5>
                  {comments[submission._id] && comments[submission._id].length > 0 ? (
                    comments[submission._id].map(comment => (
                      <div key={comment._id} className="comment-item">
                        <strong>{comment.userId ? comment.userId.username : 'Unknown'}:</strong> {comment.text}
                      </div>
                    ))
                  ) : (
                    <p>No comments yet.</p>
                  )}
                  <div className="add-comment-form">
                    <textarea
                      placeholder="Add a comment..."
                      value={newCommentText[submission._id] || ''}
                      onChange={(e) => handleCommentChange(submission._id, e.target.value)}
                      className="input" // Added global 'input' class
                    ></textarea>
                    <button onClick={() => handleCommentSubmit(submission._id)} className="btn btn-primary">Post Comment</button> {/* Added global 'btn btn-primary' class */} 
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChallengeSubmissions;