import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import './firebase.js';
import './global.css';

import Dashboard from './pages/Dashboard';
import PolicyVoting from './pages/PolicyVoting.jsx';
import CreatePolicy from './pages/CreatePolicy.jsx';  
import SignIn from './components/signin/SignIn.jsx';
import SignUp from './components/signup/SignUp.jsx';
import Profile from './pages/Profile.jsx'; 
import { AuthProvider } from './hooks/AuthContext.jsx'; 
import ProtectedRoute from './components/ProtectedRoute.jsx'; 
import Landing from './pages/Landing';
import LaporPage from './pages/LaporPage.jsx';
import AdminRoute from './components/AdminRoute.jsx';  

// Hapus kode yang dikomen di bawah ini jika tidak digunakan
// const router = createBrowserRouter ([
//   {path: "/signin", element:
//     <AuthRoute>
//       <SignIn />
//     </AuthRoute>
//   },
// ])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* sementara aja */}
          <Route path='/laporan' element={<LaporPage/>}/>

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
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile /> 
              </ProtectedRoute>
            } 
          />
          
          {/* Khusus Admin ia */}
          <Route 
            path="/create-policy" 
            element={
              <AdminRoute>
                <CreatePolicy /> 
              </AdminRoute>
            } 
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);