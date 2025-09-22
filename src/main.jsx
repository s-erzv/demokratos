import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import './firebase.js';
import './global.css';

import Dashboard from './pages/Dashboard';
import PolicyVoting from './pages/PolicyVoting.jsx';
import CreatePolicy from './pages/CreatePolicy.jsx';  
import EditPolicy from './pages/EditPolicy.jsx'; 
import PolicyDetail from './pages/PolicyDetail.jsx';
import SignIn from './components/signin/SignIn.jsx';
import SignUp from './components/signup/SignUp.jsx';
import Profile from './pages/Profile.jsx'; 
import Discussion from './pages/Discussion.jsx';
import { AuthProvider } from './hooks/AuthContext.jsx'; 
import ProtectedRoute from './components/ProtectedRoute.jsx'; 
import ThreadPage from './pages/ThreadPage.jsx';
import ReplyPage from './pages/ReplyPage.jsx';
import AllPoliciesPage from './pages/AllPoliciesPage';
import Landing from './pages/Landing';
import LaporPage from './pages/LaporPage.jsx';
import AdminRoute from './components/AdminRoute.jsx';  
import LaporDetailPage from './pages/LaporDetailPage.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rute Publik: Sign In dan Sign Up */}
          <Route path='/welcome' element={<Landing/>}/>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
 
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
            path="/vote/:policyId" 
            element={
              <ProtectedRoute>
                <PolicyDetail /> 
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/laporan" 
            element={
              <ProtectedRoute>
                <LaporPage/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/laporan/:laporanId" 
            element={
              <ProtectedRoute>
                <LaporDetailPage/> 
              </ProtectedRoute>
            } 
          />
          <Route
            path='/policies/all'
            element={
              <ProtectedRoute>
                <AllPoliciesPage />
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

          <Route 
            path="/diskusi" 
            element={
              <ProtectedRoute>
                <Discussion /> 
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/diskusi/:postId" 
            element={
              <ProtectedRoute>
                <ThreadPage /> 
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/diskusi/:postId/comment/:commentId" 
            element={
              <ProtectedRoute>
                <ReplyPage />
              </ProtectedRoute>
            } 
          />
           
          <Route 
            path="/create-policy" 
            element={
              <AdminRoute>
                <CreatePolicy /> 
              </AdminRoute>
            } 
          />
           
          <Route 
            path="/edit-policy/:policyId" 
            element={
              <AdminRoute>
                <EditPolicy /> 
              </AdminRoute>
            } 
          />

          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);