import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/AuthContext';
import { db } from '../firebase';
// Impor disederhanakan, tidak perlu collectionGroup lagi
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Loader2, Activity, TrendingUp, MessageCircle, Vote, FileText } from 'lucide-react';
import LaporList from '../features/lapor/component/subComponent/laporList';
import ChangelaporModal from '../features/lapor/component/changeLaporModal';
import DeleteModal from '../features/lapor/component/deleteModal';

// STATS VISUALS DIUBAH
const statsVisuals = [
    { 
        label: "Suara Kebijakan", 
        sublabel: "Total voting",
        unit: "Suara", 
        color: "text-blue-600", 
        bgColor: "bg-blue-50",
        icon: Vote,
        key: "votes" 
    },
    { 
        label: "Laporan Dibuat",      // <-- Diubah
        sublabel: "Total laporan Anda", // <-- Diubah
        unit: "Laporan", 
        color: "text-green-600", 
        bgColor: "bg-green-50",
        icon: FileText,
        key: "createdReports"      // <-- Diubah
    },
    { 
        label: "Komentar Aktif", 
        sublabel: "Di ruang diskusi",
        unit: "Komentar", 
        color: "text-purple-600", 
        bgColor: "bg-purple-50",
        icon: MessageCircle,
        key: "comments" 
    },
];

const UserDashboard = () => {
    const { userData, currentUser, loading: authLoading } = useAuth();
    const [loadingReports, setLoadingReports] = useState(true);
    // STATE DIUBAH
    const [stats, setStats] = useState({ votes: 0, createdReports: 0, comments: 0 });

    // FUNGSI FETCHDATA DISEDERHANAKAN
    const fetchUserData = useCallback(async () => {
        if (!currentUser) return;
        setLoadingReports(true);
        const userId = currentUser.uid;

        try { 
            // Fetch votes (tidak berubah)
            const votesQuery = query(collection(db, 'votes'), where('userId', '==', userId)); 
            const votesSnapshot = await getDocs(votesQuery);
            const votesCount = votesSnapshot.size;
            
            // Fetch comments (tidak berubah)
            const commentsQuery = query(collection(db, 'posts'), where('authorId', '==', userId)); 
            const commentsSnapshot = await getDocs(commentsQuery);
            const commentsCount = commentsSnapshot.size;
            
            // LOGIKA BARU YANG LEBIH SIMPEL
            // Query untuk menghitung laporan yang DIBUAT oleh user
            const createdReportsQuery = query(
                collection(db, 'laporan'), // Langsung ke koleksi 'laporan'
                where('authorId', '==', userId)
            );
            
            const createdReportsSnapshot = await getDocs(createdReportsQuery);
            const createdReportsCount = createdReportsSnapshot.size; // Cukup hitung jumlah dokumennya
            
            // Update state dengan data yang baru
            setStats({ 
                votes: votesCount, 
                createdReports: createdReportsCount,
                comments: commentsCount,
            });

        } catch (error) {
            console.error("Error fetching user dashboard data:", error); 
            setStats({ votes: 0, createdReports: 0, comments: 0 });
        } finally {
            setLoadingReports(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchUserData();
        }
    }, [currentUser, fetchUserData]);
    
    if (authLoading || loadingReports) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center">
                        <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-lg text-gray-600 font-medium">Memuat data pengguna...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen">
                <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
                     
                    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-10 relative overflow-hidden border border-gray-100">
                        <div className="absolute top-0 right-0 h-full w-[60%] z-0 hidden md:block">
                            <div 
                            className="w-full h-full bg-right bg-no-repeat"
                            style={{ backgroundImage: `url('/bg-userdashboard.svg')` }}
                            ></div>
                        </div>  
                        <div className="relative z-10">
                            <div className="flex items-center mb-3">
                                <Activity className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-primary" />
                                <span className="text-xs sm:text-sm font-medium text-primary">
                                    Dashboard Personal
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-700 mb-1">
                                Halo, {userData?.fullName || 'Warga Negara'}
                            </p>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                                Siap berpartisipasi hari ini?
                            </h1>
                            <div className="flex items-center">
                                <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                                <p className="text-xs sm:text-sm text-black">
                                    Kamu sudah vote {stats.votes}x minggu ini
                                </p>
                            </div>
                        </div>
                    </div>
 
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                        {statsVisuals.map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <div 
                                    key={index} 
                                    className={`${stat.bgColor} rounded-xl shadow-lg p-4 sm:p-6 border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-2">
                                                <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${stat.color}`} />
                                                <span className="text-xs sm:text-sm font-medium text-gray-600">
                                                    {stat.label}
                                                </span>
                                            </div>
                                            <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${stat.color} mb-1`}>
                                                {stats[stat.key].toLocaleString('id-ID')}
                                            </p>
                                            <p className="text-xs text-gray-500 leading-tight">
                                                {stat.sublabel}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
 
                    <section className="space-y-4 sm:space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
                            <LaporList kategori={"Laporan Anda"} />
                            <ChangelaporModal/>
                            <DeleteModal/>
                        </div>
                    </section>
                </div>
            </div>
        </MainLayout>
    );
};

export default UserDashboard;