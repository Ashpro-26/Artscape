import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Gallery from './components/Gallery';
import Forum from './components/Forum';
import PortfolioDetailView from './components/PortfolioDetailView';
import ArtistListing from './components/ArtistListing';
import ArtistCatalogue from './components/ArtistCatalogue';
import ArtistProfile from './components/ArtistProfile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import EditProfileForm from './components/EditProfileForm';
import PublicUploadArtwork from './components/PublicUploadArtwork'; // Import the new component


import WeeklyChallenge from './components/WeeklyChallenge';
import ChallengeSubmissions from './components/ChallengeSubmissions'; // New import



function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/weekly-challenge" element={<WeeklyChallenge />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/public-upload-artwork" element={<PublicUploadArtwork />} /> {/* New route for public upload */}
          
          <Route path="/forum" element={<Forum />} />
          <Route path="/artists" element={<ArtistListing />} />
          <Route path="/artist-catalogue" element={<ArtistCatalogue />} />
          <Route path="/artists/create" element={<EditProfileForm />} />
          <Route path="/artists/:artistId/edit" element={<EditProfileForm />} />
          <Route path="/artists/:artistId" element={<ArtistProfile />} />
          <Route path="/portfolio/:artworkId" element={<PortfolioDetailView />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/challenge/:challengeId/submissions" element={<ChallengeSubmissions />} /> {/* New route */}
          
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;