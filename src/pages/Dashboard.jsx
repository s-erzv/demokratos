import React from 'react';
import { useAuth } from '../hooks/AuthContext';
import UserDashboard from './UserDashboard';  
import AdminDashboard from './AdminDashboard';  
import MainLayout from '../components/MainLayout';

const AdminDashboardPlaceholder = () => (
    <MainLayout>
        <div className="p-8">
            <h1 className='text-3xl font-bold text-red-600'>Admin Dashboard</h1>
            <p className='text-gray-600 mt-2'>Selamat datang, Administrator. Tempat untuk statistik dan manajemen sistem.</p>
        </div>
    </MainLayout>
);


const Dashboard = () => {
    const { userData, loading } = useAuth();

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-[50vh]">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <p className="ml-3 text-lg text-gray-600">Memuat dashboard...</p>
                </div>
            </MainLayout>
        );
    }
     
    if (userData?.role === 'admin') {
        return <AdminDashboard />;
        return <AdminDashboardPlaceholder />; 
    }
 
    return <UserDashboard />;
};

export default Dashboard;