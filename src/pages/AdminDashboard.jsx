import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Users, FileText, Mic, Shield, Loader2, PlusCircle, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
 
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'; 
ChartJS.register(Title, Tooltip, Legend, ArcElement);

const statsVisuals = [
    { label: "Total Pengguna Terdaftar", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50", key: "totalUsers" },
    { label: "Kebijakan Aktif", icon: Shield, color: "text-green-600", bgColor: "bg-green-50", key: "activePolicies" },
    { label: "Total Suara Tercatat", icon: TrendingUp, color: "text-purple-600", bgColor: "bg-purple-50", key: "totalVotes" },
    { label: "Total Laporan Masuk", icon: FileText, color: "text-orange-600", bgColor: "bg-orange-50", key: "totalReports" },
];

const AdminDashboard = () => {
    const { userData, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ totalUsers: 0, activePolicies: 0, totalVotes: 0, totalReports: 0 });
    const [priorities, setPriorities] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [chartData, setChartData] = useState(null);

    const fetchAdminData = useCallback(async () => {
        setLoadingData(true);
        try { 
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const votesSnapshot = await getDocs(collection(db, 'votes'));
            const reportsSnapshot = await getDocs(collection(db, 'laporan'));
 
            const reportsCollection = collection(db, 'laporan');
            const priorityQuery = query(reportsCollection, orderBy('pendukung', 'desc'), limit(3));
            const prioritySnapshot = await getDocs(priorityQuery);
            const fetchedPriorities = prioritySnapshot.docs.map(doc => {
                 const data = doc.data();
                 return {
                     id: doc.id,
                     title: data.judul,
                     location: data.alamat,
                     totalVotes: data.pendukung,
                     status: data.status,
                 };
            });
 
            const allActivePoliciesQuery = query(
                collection(db, 'policies'),
                where('status', '==', 'Active')
            );
            const activePoliciesSnapshot = await getDocs(allActivePoliciesQuery);

            let totalVotesYes = 0;
            let totalVotesNo = 0;

            activePoliciesSnapshot.forEach(doc => {
                const policy = doc.data();
                totalVotesYes += policy.votesYes || 0;
                totalVotesNo += policy.votesNo || 0;
            });
 
            setChartData({
                labels: ['Setuju', 'Tidak Setuju'],
                datasets: [
                    {
                        label: ' Jumlah Suara',
                        data: [totalVotesYes, totalVotesNo],
                        backgroundColor: [
                            'rgba(34, 197, 94, 0.8)',  
                            'rgba(239, 68, 68, 0.8)', 
                        ],
                        borderColor: [
                            'rgba(34, 197, 94, 1)',
                            'rgba(239, 68, 68, 1)',
                        ],
                        borderWidth: 2,
                        hoverOffset: 8,
                    },
                ],
            });

            setStats({
                totalUsers: usersSnapshot.size,
                activePolicies: activePoliciesSnapshot.size,
                totalVotes: votesSnapshot.size,
                totalReports: reportsSnapshot.size,
            });
            setPriorities(fetchedPriorities);

        } catch (error) {
            console.error("Error fetching admin dashboard data:", error);
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
                <div className="flex justify-center items-center h-screen">
                    <div className="text-center">
                        <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-lg text-gray-600 font-medium">Memuat data dashboard Admin...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }
     
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, 
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 14,
                        family: "'Inter', sans-serif"
                    }
                }
            },
            title: {
                display: true,
                text: 'Agregat Suara dari Seluruh Kebijakan Aktif',
                font: {
                    size: 16,
                    weight: 'bold',
                    family: "'Inter', sans-serif"
                },
                padding: {
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return ` ${context.label}: ${context.parsed.toLocaleString('id-ID')} suara (${percentage}%)`;
                    }
                }
            }
        },
        elements: {
            arc: {
                borderWidth: 2,
                borderColor: '#fff'
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'aktif':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed':
            case 'selesai':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'rejected':
            case 'ditolak':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const backgroundStyle = { 
        backgroundImage: `url('/bg-userdashboard.svg')`, 
        backgroundPosition: 'right',
        backgroundRepeat: 'no-repeat',
    };

    return (
        <MainLayout>
            <div className="min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                    
                    {/* Header Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10 relative overflow-hidden border border-gray-100"
                    style={backgroundStyle}> 
                        
                        <div className="relative z-10">
                            <div className="flex items-center mb-4">
                                <Activity className="w-8 h-8 mr-3 text-primary" />
                                <span className="text-sm sm:text-base font-medium text-primary">
                                    Dashboard Admin
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                                Selamat datang, {userData?.fullName || 'Admin'}!
                            </h1>
                            <p className="text-gray-500 text-sm sm:text-base lg:text-lg max-w-3xl">
                                Pantau laporan warga dan hasil voting secara real-time dalam satu dashboard yang komprehensif
                            </p>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {statsVisuals.map((stat, index) => {
                            const IconComponent = stat.icon;
                            const value = stats[stat.key].toLocaleString('id-ID');
                            return (
                                <div key={index} className={`${stat.bgColor} rounded-xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-gray-600 text-sm font-medium mb-2">
                                                {stat.label}
                                            </p>
                                            <p className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>
                                                {value}
                                            </p>
                                        </div>
                                        <div className={`p-3 rounded-full ${stat.color.replace('text-', 'bg-').replace('600', '100')}`}>
                                            <IconComponent size={24} className={stat.color} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Bottom Section: Chart & Priorities */}
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                        
                        {/* Chart Section */}
                        <div className="xl:col-span-2 bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                            <div className="flex items-center mb-6">
                                <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-800">
                                    Sentimen Publik
                                </h2>
                            </div>
                            <div className="h-80 w-full flex justify-center items-center">
                                {chartData ? (
                                    <div className="w-full h-full">
                                        <Pie options={chartOptions} data={chartData} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                                        <p className="text-gray-400">Memuat data grafik...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Priorities Section */}
                        <div className="xl:col-span-3 bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <TrendingUp className="w-6 h-6 mr-3 text-orange-600" />
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Laporan Prioritas
                                    </h2>
                                </div>
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    Top 3
                                </span>
                            </div>
                            
                            <div className="space-y-4">
                                {priorities.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500 text-lg font-medium">Tidak ada laporan prioritas</p>
                                        <p className="text-gray-400 text-sm">Laporan akan muncul di sini ketika sudah tersedia</p>
                                    </div>
                                ) : (
                                    priorities.map((item, index) => (
                                        <div key={item.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 mr-4">
                                                    <div className="flex items-center mb-2">
                                                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full mr-3">
                                                            #{index + 1}
                                                        </span>
                                                        <Link 
                                                            to={`/vote/${item.id}`} 
                                                            className="text-base font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2"
                                                        >
                                                            {item.title}
                                                        </Link>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mb-2 flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {item.location || 'Lokasi tidak diketahui'}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end space-y-2">
                                                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(item.status)}`}>
                                                        {item.status || 'Pending'}
                                                    </span>
                                                    <div className="flex items-center text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                                                        <Users className="w-4 h-4 mr-1" />
                                                        {item.totalVotes.toLocaleString('id-ID')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default AdminDashboard;