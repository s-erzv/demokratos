import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext'; 

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen text-lg">Memuat autentikasi...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;