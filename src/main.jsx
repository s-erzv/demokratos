import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import './firebase.js';
import './global.css';

import Dashboard from './pages/Dashboard';
import PolicyVoting from './pages/PolicyVoting.jsx';
import SignIn from './components/signin-temp/signin.jsx';
import SignUp from './components/signup/SignUp.jsx';
import Profile from './pages/Profile.jsx'; 
import { AuthProvider } from './hooks/AuthContext.jsx'; 
import ProtectedRoute from './components/ProtectedRoute.jsx'; 



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rute Publik: Sign In dan Sign Up */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Rute Terlindungi (Membutuhkan Login) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/vote" 
            element={
              <ProtectedRoute>
                <PolicyVoting />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile /> 
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);