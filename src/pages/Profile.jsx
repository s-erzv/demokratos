import React from 'react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/AuthContext'; 
import { LogOut, UserCircle } from 'lucide-react';

const Profile = () => {
  const { userData, logout } = useAuth();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Profil Pengguna</h1>
        
        <div className="flex items-center space-x-6 mb-8">
            <UserCircle size={64} className="text-primary" />
            <div>
                <p className="text-xl font-semibold text-gray-900">{userData?.fullName || 'Nama Tidak Tersedia'}</p>
                <p className="text-sm text-gray-500">@{userData?.email.split('@')[0]}</p>
            </div>
        </div>

        <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Email:</p>
                <p className="text-gray-900">{userData?.email}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">NIK:</p>
                <p className="text-gray-900">{userData?.nik}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Peran (Role):</p>
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full 
                    ${userData?.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {userData?.role || 'user'}
                </span>
            </div>
        </div>

        <button
          onClick={logout}
          className="mt-8 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-secondary hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
        >
          <LogOut size={18} className="mr-2" />
          Keluar (Logout)
        </button>
      </div>
    </MainLayout>
  );
};

export default Profile;