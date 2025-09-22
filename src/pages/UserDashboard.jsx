import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, count } from 'firebase/firestore'; // Import count
import { Filter, Loader2 } from 'lucide-react';
 
const UserReportCard = ({ children }) => (
    <div className="overflow-x-auto whitespace-nowrap pb-4" style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {children}
        <style jsx="true">{`
            /* Sembunyikan scrollbar untuk pengalaman mobile yang mulus */
            .overflow-x-auto::-webkit-scrollbar { display: none; }
            .overflow-x-auto { -ms-overflow-style: none; }
        `}</style>
    </div>
);
 
const statsVisuals = [
    { label: "Total suara kebijakan yang sudah Anda berikan", unit: "Suara", color: "text-primary", key: "votes" },
    { label: "Laporan publik yang sudah Anda dukung", unit: "Laporan", color: "text-red-600", key: "reports" },
    { label: "Komentar Anda di ruang diskusi", unit: "Komentar", color: "text-red-700", key: "comments" },
];

const UserDashboard = () => {
    const { userData, currentUser, loading: authLoading } = useAuth();
    const [userReports, setUserReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);
     
    const [stats, setStats] = useState({ votes: 0, reports: 0, comments: 0 }); 
 
    const fetchUserData = useCallback(async () => {
        if (!currentUser) return;
        setLoadingReports(true);
        const userId = currentUser.uid;

        try { 
            const votesCollection = collection(db, 'votes');
            const votesQuery = query(votesCollection, where('userId', '==', userId)); 
            const votesSnapshot = await getDocs(votesQuery);
            const votesCount = votesSnapshot.size;
             
            const policiesCollection = collection(db, 'policies');
            const reportsQuery = query(
                policiesCollection, 
                where('authorId', '==', userId), 
                orderBy('createdAt', 'desc')
            ); 
            const reportsSnapshot = await getDocs(reportsQuery);

            const reports = reportsSnapshot.docs.map(doc => {
                const data = doc.data();
                const dateObject = data.dueDate ? data.dueDate.toDate() : new Date();
                const formattedDate = dateObject.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                
                return {
                    id: doc.id,
                    ...data,
                    category: 'Laporan', 
                    title: data.title, 
                    description: data.description,
                    date: formattedDate,
                    votes: (data.votesYes + data.votesNo) || 0, 
                };
            });
             
            const commentsCollection = collection(db, 'posts');  
            const commentsQuery = query(commentsCollection, where('authorId', '==', userId)); 
            const commentsSnapshot = await getDocs(commentsQuery);
            const commentsCount = commentsSnapshot.size;
             
            setUserReports(reports);
            setStats({ 
                votes: votesCount, 
                reports: reports.length, 
                comments: commentsCount,
            });

        } catch (error) {
            console.error("Error fetching user dashboard data:", error); 
            setStats({ votes: 0, reports: 0, comments: 0 });
        } finally {
            setLoadingReports(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchUserData();
        }
    }, [currentUser, fetchUserData]);
    
    if (authLoading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-[50vh]">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <p className="ml-3 text-lg text-gray-600">Memuat data pengguna...</p>
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
                 
                <div 
                    className="bg-white rounded-3xl shadow-lg p-6 sm:p-10 relative overflow-hidden border border-gray-100"
                    style={backgroundStyle}
                > 
                    <div className="relative z-10">
                        <p className="text-sm sm:text-base text-gray-600">Halo, {userData?.fullName || 'Warga Negara'}</p>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mt-1 mb-2">
                            Siap berpartisipasi hari ini?
                        </h1>
                        <p className="text-sm text-gray-500">
                            Kamu sudah vote {stats.votes}x minggu ini
                        </p>
                    </div>
                </div>
 
                <div className="grid grid-cols-3 gap-4 sm:gap-6">
                    {statsVisuals.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center border border-gray-100">
                            <p className={`text-3xl sm:text-4xl font-extrabold ${stat.color} mb-1`}>
                                {stats[stat.key]}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 leading-tight">
                                {stat.label}
                            </p>
                            <span className="text-sm font-semibold text-gray-400 mt-2 block">{stat.unit}</span>
                        </div>
                    ))}
                </div>
 
                <section className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            Ringkasan Laporan Saya
                        </h2>
                        <button className="flex items-center text-sm font-semibold bg-primary text-white py-1 px-4 rounded-full hover:bg-red-700 transition-colors">
                            <Filter size={16} className="mr-1" />
                            Filter
                        </button>
                    </div>
                    
                    {loadingReports ? (
                        <div className="flex justify-center py-10">
                             <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                    ) : userReports.length === 0 ? (
                        <p className="text-gray-500 text-base text-center py-10">
                            Anda belum membuat laporan apa pun.
                        </p>
                    ) : (
                        <UserReportCard>
                            {userReports.map(report => (
                                <div key={report.id} className="inline-block pr-4 last:pr-0 align-top w-[calc(100vw-4rem)] sm:w-[340px] md:w-[380px]">
                                    <Card 
                                        {...report}
                                        isAdmin={false} 
                                    /> 
                                </div>
                            ))} 
                            <div className="inline-flex items-center justify-center h-full w-[calc(100vw-4rem)] sm:w-[150px] md:w-[150px] ml-4">
                                <Link to="/laporan" className="flex flex-col items-center text-primary hover:text-red-700 transition-colors text-center text-sm font-semibold">
                                    Lihat Semua Laporan
                                    <ChevronRight size={18} className="mt-1" />
                                </Link>
                            </div>
                        </UserReportCard>
                    )}
                </section>

            </div>
        </MainLayout>
    );
};

export default UserDashboard;