import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext'; 
import ProtectedRoute from './ProtectedRoute';

const AdminRoute = ({ children }) => {
  const { userData, loading } = useAuth();
  
  if (loading) {
    // Tampilkan loading state, diwariskan dari ProtectedRoute
    return <div className="flex justify-center items-center h-screen text-lg">Memuat autentikasi...</div>; 
  }

  // Jika user bukan admin, arahkan ke halaman utama (Dashboard)
  if (userData && userData.role !== 'admin') {
    // Anda bisa mengarahkan ke halaman 404 atau dashboard dengan pesan error
    alert("Akses ditolak. Hanya Admin yang dapat mengakses halaman ini.");
    return <Navigate to="/" replace />;
  }

  // Gunakan ProtectedRoute untuk memastikan user sudah login
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoute;