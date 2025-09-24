import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import './firebase.js';
import './global.css';

// Page Imports
import Dashboard from './pages/Dashboard';
import PolicyVoting from './pages/PolicyVoting.jsx';
import CreatePolicy from './pages/CreatePolicy.jsx';  
import EditPolicy from './pages/EditPolicy.jsx'; 
import PolicyDetail from './pages/PolicyDetail.jsx';
import SignIn from './components/signin/SignIn.jsx';
import SignUp from './components/signup/SignUp.jsx';
import Profile from './pages/Profile.jsx'; 
import Discussion from './pages/Discussion.jsx';
import ThreadPage from './pages/ThreadPage.jsx';
import ReplyPage from './pages/ReplyPage.jsx';
import AllPoliciesPage from './pages/AllPoliciesPage';
import Landing from './pages/Landing';
import LaporPage from './pages/LaporPage.jsx';
import LaporDetailPage from './pages/LaporDetailPage.jsx'; 
import LaporLengkapPage from './pages/LaporLengkapPage.jsx';

// Context and Route Guards
import { AuthProvider, useAuth } from './hooks/AuthContext.jsx'; 
import { PolicyProvider } from './features/policy-voting/hooks/usePolicy.jsx';
 
const AuthLoader = () => (
  <div className="flex justify-center items-center h-screen text-lg">
    Memuat sesi...
  </div>
);
 
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <AuthLoader />;
  return currentUser ? children : <Navigate to="/signin" replace />;
};
 
const AdminRoute = ({ children }) => {
  const { userData, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (userData && userData.role !== 'admin') {
    alert("Akses ditolak. Hanya Admin yang dapat mengakses halaman ini.");
    return <Navigate to="/" replace />;
  }
  return <ProtectedRoute>{children}</ProtectedRoute>;
};
 
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <AuthLoader />;
  return currentUser ? <Navigate to="/" replace /> : children;
};
 
const WelcomeRoute = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return <AuthLoader />;
  return currentUser ? <Dashboard /> : <Navigate to="/welcome" replace />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes> 
          <Route 
            path="/welcome" 
            element={<PublicRoute><Landing /></PublicRoute>} 
          />
          <Route 
            path="/signin" 
            element={<PublicRoute><SignIn /></PublicRoute>} 
          />
          <Route 
            path="/signup" 
            element={<PublicRoute><SignUp /></PublicRoute>} 
          />
 
          <Route path="/" element={<WelcomeRoute />} />
           
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/vote" element={<ProtectedRoute><PolicyVoting /></ProtectedRoute>} />
          <Route 
            path="/vote/:policyId" 
            element={
              <ProtectedRoute>
                <PolicyProvider>
                  <PolicyDetail />
                </PolicyProvider> 
              </ProtectedRoute>
            } 
          />
          <Route path="/laporan" element={<ProtectedRoute><LaporPage/></ProtectedRoute>} />
          <Route path="/laporan/:laporanId" element={<ProtectedRoute><LaporDetailPage/></ProtectedRoute>} />
          <Route path="/laporan/all" element={<ProtectedRoute><LaporLengkapPage/></ProtectedRoute>} />
          <Route path='/policies/all' element={<ProtectedRoute><AllPoliciesPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/diskusi" element={<ProtectedRoute><Discussion /></ProtectedRoute>} />
          <Route path="/diskusi/:postId" element={<ProtectedRoute><ThreadPage /></ProtectedRoute>} />
          <Route path="/diskusi/:postId/comment/:commentId" element={<ProtectedRoute><ReplyPage /></ProtectedRoute>} />
            
          <Route path="/create-policy" element={<AdminRoute><CreatePolicy /></AdminRoute>} />
          <Route path="/edit-policy/:policyId" element={<AdminRoute><EditPolicy /></AdminRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);