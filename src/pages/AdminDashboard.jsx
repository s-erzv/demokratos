import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { Users, FileText, Mic, Clock, Shield, Loader2, PlusCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const CF_BASE_URL = 'https://us-central1-demokratos-5b0ce.cloudfunctions.net/'; // Untuk Cloud Functions jika diperlukan

// Statis untuk visual layout statistik
const statsVisuals = [
    { label: "Total Pengguna Terdaftar", icon: Users, color: "text-red-600", key: "totalUsers" },
    { label: "Kebijakan Aktif", icon: Mic, color: "text-blue-600", key: "activePolicies" },
    { label: "Total Suara Tercatat", icon: Shield, color: "text-green-600", key: "totalVotes" },
    { label: "Total Laporan Masuk", icon: FileText, color: "text-yellow-600", key: "totalReports" },
];

const AdminDashboard = () => {
    const { userData, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ totalUsers: 0, activePolicies: 0, totalVotes: 0, totalReports: 0 });
    const [priorities, setPriorities] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const fetchAdminData = useCallback(async () => {
        setLoadingData(true);
        try {
            // --- 1. MENGHITUNG TOTAL PENGGUNA ---
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const totalUsers = usersSnapshot.size;
            
            // --- 2. MENGHITUNG KEBIJAKAN AKTIF (Policies) ---
            const policiesCollection = collection(db, 'policies');
            const activePoliciesQuery = query(policiesCollection, where('status', '==', 'Active'));
            const activePoliciesSnapshot = await getDocs(activePoliciesQuery);
            const activePoliciesCount = activePoliciesSnapshot.size;

            // --- 3. MENGHITUNG TOTAL SUARA TERCATAT (VOTES) ---
            const votesSnapshot = await getDocs(collection(db, 'votes'));
            const totalVotesCount = votesSnapshot.size;

            // --- 4. MENGHITUNG TOTAL LAPORAN (Simulasi: Koleksi 'laporan' atau 'posts') ---
            const reportsSnapshot = await getDocs(collection(db, 'laporan')); // Menggunakan 'laporan' sesuai screenshot Firestore
            const totalReportsCount = reportsSnapshot.size;

            // --- 5. MENGAMBIL LAPORAN PRIORITAS (5 Policies dengan vote terbanyak) ---
            const priorityQuery = query(
                policiesCollection,
                orderBy('votesYes', 'desc'), // Mengurutkan berdasarkan vote Yes sebagai simulasi prioritas
                limit(5)
            );
            const prioritySnapshot = await getDocs(priorityQuery);

            const fetchedPriorities = prioritySnapshot.docs.map(doc => {
                const data = doc.data();
                const total = data.votesYes + data.votesNo;
                return {
                    id: doc.id,
                    title: data.title,
                    location: 'Jakarta Pusat', // Placeholder lokasi
                    votesYes: data.votesYes || 0,
                    votesNo: data.votesNo || 0,
                    totalVotes: total,
                    percentageYes: total > 0 ? ((data.votesYes / total) * 100).toFixed(0) : 50,
                };
            });

            setStats({
                totalUsers: totalUsers,
                activePolicies: activePoliciesCount,
                totalVotes: totalVotesCount,
                totalReports: totalReportsCount,
            });
            setPriorities(fetchedPriorities);

        } catch (error) {
            console.error("Error fetching admin dashboard data:", error);
            // Tetapkan stats ke 0 jika terjadi error
            setStats({ totalUsers: 0, activePolicies: 0, totalVotes: 0, totalReports: 0 });
            setPriorities([]);
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    if (authLoading || loadingData) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-[50vh]">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <p className="ml-3 text-lg text-gray-600">Memuat data dashboard Admin...</p>
                </div>
            </MainLayout>
        );
    }
    
    const backgroundStyle = { 
        backgroundImage: `url('/bg-userdashboard.svg')`, 
        backgroundPosition: 'right',
        backgroundRepeat: 'no-repeat',
    };

    return (
        <MainLayout>
            <div className="space-y-8">
                
                {/* Header: Halo, Admin! */}
                <div 
                    className="bg-white rounded-xl shadow-lg p-6 sm:p-10 relative overflow-hidden border border-gray-100"
                    style={backgroundStyle}
                >
                    <div className="relative z-10">
                        <p className="text-sm sm:text-base text-gray-600">Halo, {userData?.fullName || 'Admin'}</p>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-800 mt-1 mb-2">
                            Pantau laporan warga dan hasil voting secara real-time
                        </h1>
                    </div>
                </div>

                {/* Statistik Kunci (4 Kotak) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {statsVisuals.map((stat, index) => {
                        const IconComponent = stat.icon;
                        const value = stats[stat.key].toLocaleString('id-ID');
                        return (
                            <div key={index} className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center border border-gray-100">
                                <div className="flex items-center justify-center mb-2">
                                    <IconComponent size={24} className={stat.color} />
                                </div>
                                <p className={`text-2xl sm:text-3xl font-extrabold text-gray-800 mb-1`}>
                                    {value}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500 leading-tight">
                                    {stat.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
                
                {/* Bagian Bawah: Grafik & Prioritas (Grid 2 Kolom) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Kolom Kiri Bawah: Grafik Perbandingan */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                            Perbandingan Vote Kebijakan
                        </h2>
                        {/* Placeholder untuk CHART */}
                        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
                            <p className="text-gray-400">Placeholder Grafik Bar/Pie</p>
                        </div>
                    </div>

                    {/* Kolom Kanan Bawah: Laporan Prioritas */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                            Laporan Prioritas
                        </h2>
                        <div className="space-y-4">
                            {priorities.length === 0 ? (
                                <p className="text-gray-500 text-sm py-5 text-center">Tidak ada laporan prioritas saat ini.</p>
                            ) : (
                                priorities.map((item, index) => (
                                    <div key={item.id} className="border-b pb-3 last:border-b-0 flex justify-between items-center">
                                        <div>
                                            <Link to={`/vote/${item.id}`} className="text-base font-semibold text-gray-800 hover:text-primary transition-colors">
                                                {item.title}
                                            </Link>
                                            <p className="text-xs text-gray-500">{item.location || 'Lokasi tidak diketahui'}</p>
                                        </div>
                                        <div className="text-right flex items-center space-x-2">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.percentageYes > 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {item.percentageYes}% Setuju
                                            </span>
                                            <span className="text-sm text-gray-600">{item.totalVotes.toLocaleString('id-ID')} Suara</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Tombol Buat Kebijakan Baru (Akses Cepat) */}
                <div className="fixed bottom-8 right-8 z-30">
                    <Link 
                        to="/create-policy" 
                        className="flex items-center p-4 bg-primary text-white rounded-full shadow-lg hover:bg-red-700 transition-colors transform hover:scale-110"
                        aria-label="Buat Vote Baru"
                    >
                        <PlusCircle size={28} />
                    </Link>
                </div>
            </div>
        </MainLayout>
    );
};

export default AdminDashboard;