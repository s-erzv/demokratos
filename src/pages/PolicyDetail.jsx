import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/MainLayout';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, functions } from '../firebase';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { Loader2, Users, Download, ThumbsUp, ThumbsDown, Send, ArrowLeft, Bot } from 'lucide-react';
import VotingModal from '../components/VotingModal';
import { useVoting } from '../hooks/useVoting';
import { useAuth } from '../hooks/AuthContext';
import PolicyDiscussion from '../features/discussion/DiscussionForm';
import PolicyDiscussionList from '../features/discussion/PolicyDiscussionList';
import DiscussionForm from '../features/discussion/DiscussionForm';


const PolicyDetail = () => {
    const [isDiscussion, setIsDiscussion] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [posts, setPosts] = useState([]);
    const { policyId } = useParams();
    const navigate = useNavigate();
    const { currentUser, isAdmin, userData } = useAuth();

    const [policy, setPolicy] = useState(null);
    const [comments, setComments] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    
    // State untuk analisis sentimen
    const [sentimentData, setSentimentData] = useState(null);
    const [loadingSentiment, setLoadingSentiment] = useState(false);
    const [errorSentiment, setErrorSentiment] = useState(null);
    
    
    // Fungsi untuk memeriksa status voting (Dependency paling dasar: currentUser)
    const checkUserVoteStatus = useCallback(async (id) => {
        if (!currentUser || !id) {
            setHasVoted(false);
            return;
        }

        try {
            const voteDocRef = doc(db, 'votes', `${currentUser.uid}_${id}`);
            const voteSnap = await getDoc(voteDocRef);
            setHasVoted(voteSnap.exists);
        } catch (err) {
            console.error("Gagal memeriksa status vote:", err);
            setHasVoted(false);
        }
    }, [currentUser]);

    // Fungsi untuk mengambil data policy (detail)
    const fetchPolicyData = useCallback(async () => {
        if (!policyId) return;

        setLoading(true);
        setError('');
        
        try {
            const policyDocRef = doc(db, 'policies', policyId);
            const docSnap = await getDoc(policyDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                
                const dateObject = data.dueDate ? data.dueDate.toDate() : new Date();
                const formattedDeadline = dateObject.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

                setPolicy({
                    id: docSnap.id,
                    ...data,
                    category: data.type === 'kebijakan' ? 'Kebijakan' : 'Program',
                    formattedDeadline,
                });
                
                // Ambil data sentimen yang di-cache di dokumen policy
                if (data.sentimentAnalysis) {
                    setSentimentData(data.sentimentAnalysis);
                } else {
                    setSentimentData(null);
                }
                
                if (currentUser) {
                    checkUserVoteStatus(docSnap.id);
                }
                
            } else {
                setError("Kebijakan tidak ditemukan.");
            }
        } catch (err) {
            setError("Gagal memuat detail kebijakan. Periksa aturan Firestore.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [policyId, currentUser, checkUserVoteStatus]);

    
    // FUNGSI UNTUK REFRESH DATA (dipanggil setelah vote sukses)
    const handleRefetch = useCallback(() => {
        fetchPolicyData();
        checkUserVoteStatus(policyId);
    }, [policyId, fetchPolicyData, checkUserVoteStatus]);

    const { 
        isModalOpen, 
        openModal, 
        closeModal, 
        submitVote, 
        loadingVote, 
        errorVote 
    } = useVoting(handleRefetch);
    
    // Fungsi untuk memicu analisis sentimen (HANYA ADMIN)
    const triggerSentimentAnalysis = useCallback(async () => {
        if (!currentUser) {
            setErrorSentiment("Kesalahan otentikasi: Anda harus login."); 
            return;
        }
        if (!isAdmin || !policyId) return;
        
        setLoadingSentiment(true);
        setErrorSentiment(null);
        setSentimentData(null); 

        try {
            const idToken = await currentUser.getIdToken(true); 

            // FIX: Pastikan HEADERS dan BODY terformat JSON dengan benar.
            const response = await fetch('https://us-central1-demokratos-5b0ce.cloudfunctions.net/analyzePolicySentiment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`, 
                },
                body: JSON.stringify({ 
                    policyId: policyId 
                }),
            });
            
            const result = await response.json(); 

            if (response.ok && result.status === 'success' && result.data) {
                setSentimentData(result.data);
                alert("Analisis sentimen berhasil diperbarui!");
            } else if (response.ok && result.status === 'success' && !result.data) {
                alert(result.message);
            } else {
                setErrorSentiment(result.message || `Gagal memicu analisis. Status: ${response.status}`);
            }
            
            fetchPolicyData();

        } catch (err) {
            console.error("Error triggering sentiment analysis:", err);
            if (err.code === 'unauthenticated') {
                setErrorSentiment("Gagal: Sesi Anda mungkin berakhir. Silakan logout dan login ulang.");
            } else {
                setErrorSentiment(err.message || "Gagal memicu analisis. Cek log Cloud Function.");
            }
        } finally {
            setLoadingSentiment(false);
        }
    }, [isAdmin, policyId, fetchPolicyData, currentUser]); 

    useEffect(() => {
        fetchPolicyData();
    }, [fetchPolicyData]);
    
    // Placeholder untuk fetchPosts tetap sama
    const fetchPosts = useCallback(async () => {
        if (!policyId) return;

        try {
            const postsCollection = collection(db, 'posts');
            let q; 

            const baseQuery = query(
                postsCollection, 
                where("sourceId", "==", policyId)
            );

            if (searchTerm.trim() !== '') {
                q = query(
                    baseQuery, 
                    where('keywords', 'array-contains', searchTerm.toLowerCase())
                );
            } else {
                q = query(baseQuery, orderBy('createdAt', 'desc'));
            }

            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(postsData); 

        } catch (error) {
            console.error("Error fetching posts for policy:", error);
        } 
    }, [searchTerm, policyId]);

    const refreshDiscussions = () => {
        // Trik sederhana untuk refresh: ubah key di komponen list
        // Tapi untuk sekarang, kita bisa biarkan kosong karena komponen akan refresh sendiri
    };

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    
    // Tampilkan Loading state
    if (loading || loadingVote) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-[50vh]">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <p className="ml-3 text-lg text-gray-600">Memuat detail kebijakan...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto p-8 text-center mt-20">
                    <h1 className="text-3xl font-bold text-red-600">Error</h1>
                    <p className="text-gray-600 mt-4">{error}</p>
                    <button onClick={() => navigate('/vote')} className="mt-6 text-primary hover:underline">Kembali ke Daftar Vote</button>
                </div>
            </MainLayout>
        );
    }
    
    const policyData = policy;
    const votesYes = policyData.votesYes || 0;
    const votesNo = policyData.votesNo || 0;
    const totalVotes = votesYes + votesNo;
    const percentageYes = totalVotes > 0 ? ((votesYes / totalVotes) * 100).toFixed(1) : 50;
    const percentageNo = totalVotes > 0 ? (100 - percentageYes).toFixed(1) : 50;

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
                
                {/* Kolom KIRI: Detail Konten (2/3 lebar) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Header Image dan Tombol Kembali */}
                    <div className="h-96 w-full rounded-xl overflow-hidden shadow-lg relative">
                        {/* Tombol Kembali di Pojok Kiri Atas Gambar */}
                        <button
                            onClick={() => navigate(-1)} 
                            className="absolute top-4 left-4 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
                            aria-label="Kembali"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        
                        <img 
                            src={policyData.thumbnailUrl} 
                            alt={policyData.title} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                    
                    {/* Detail Teks */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <span className="inline-block border border-primary bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                            {policyData.category}
                        </span>
                        
                        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
                            {policyData.title}
                        </h1>
                        
                        {/* Konten Deskripsi */}
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed mb-6">
                            {policyData.description}
                        </p>
                        
                        {/* Download Link */}
                        {policyData.documentUrl && (
                            <a 
                                href={policyData.documentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-primary font-semibold hover:text-red-800 transition-colors"
                            >
                                <Download size={20} className="mr-2" />
                                Download dokumen resmi
                            </a>
                        )}
                    </div>
                </div>

                {/* Kolom KANAN: Voting Widget & Analisis Sentimen */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Voting Widget Card */}
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Hasil Voting Sementara</h2>
                        
                        {/* Pie Chart (Simulasi dengan Div) */}
                        <div className="flex justify-center items-center h-48 w-48 mx-auto relative mb-6">
                            <div 
                                className="w-full h-full rounded-full" 
                                style={{
                                    background: `conic-gradient(
                                        #4CAF50 0% ${percentageYes}%, 
                                        #F44336 ${percentageYes}% 100%
                                    )`
                                }}
                            />
                            {/* Inner Circle / Hole in the Doughnut Chart */}
                            <div className="absolute inset-4 bg-white rounded-full flex flex-col justify-center items-center">
                                <span className="text-3xl font-extrabold text-primary">{percentageYes}%</span>
                                <span className="text-sm text-gray-500">Setuju</span>
                            </div>
                        </div>

                        <div className="flex justify-around text-sm font-semibold mb-4">
                            <p className="text-green-600">Setuju: {votesYes.toLocaleString('id-ID')}</p>
                            <p className="text-red-600">Tidak Setuju: {votesNo.toLocaleString('id-ID')}</p>
                        </div>
                        
                        <div className="flex items-center justify-center text-sm text-gray-600 mb-6">
                            <Users size={18} className="text-secondary mr-2" />
                            <span className="font-medium">{totalVotes.toLocaleString('id-ID')}</span>
                            <span className="ml-1">orang sudah berpartisipasi</span>
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-3">Voting berakhir: {policyData.formattedDeadline}</p>

                        {/* Tombol Berikan Suara */}
                        <button 
                            onClick={openModal} 
                            disabled={hasVoted || !currentUser}
                            className="w-full py-3 bg-primary text-white font-bold rounded-full hover:bg-red-800 transition-colors disabled:bg-gray-400"
                        >
                            {hasVoted ? 'Anda Sudah Berpartisipasi' : !currentUser ? 'Login untuk Berikan Suara' : 'Berikan Suara'}
                        </button>
                        
                        {/* === LOKASI TOMBOL ANALISIS SENTIMEN (ADMIN ONLY) === */}
                        {isAdmin && (
                            <button
                                onClick={triggerSentimentAnalysis}
                                disabled={loadingSentiment}
                                className="w-full mt-3 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center text-sm"
                            >
                                {loadingSentiment ? (
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                ) : (
                                    <>
                                        <Bot size={16} className="mr-2" />
                                        Mulai Analisis Sentimen
                                    </>
                                )}
                            </button>
                        )}
                        {/* === AKHIR LOKASI TOMBOL === */}

                    </div>

                    {/* === KARTU ANALISIS SENTIMEN DISPLAY (ADMIN ONLY) === */}
                    {isAdmin && (
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center mb-3 border-b pb-2">
                                <Bot size={24} className="text-blue-600 mr-2" />
                                <h2 className="text-xl font-bold text-gray-800">Analisis Sentimen AI</h2>
                            </div>
                            
                            {loadingSentiment ? (
                                <div className="flex justify-center py-5">
                                    <Loader2 size={24} className="animate-spin text-blue-600" />
                                    <p className="ml-3 text-sm text-gray-600">Menganalisis aspirasi...</p>
                                </div>
                            ) : sentimentData ? (
                                <div className='space-y-3'>
                                    <p className="text-sm">
                                        <span className="font-semibold">Kesimpulan:</span> {sentimentData.sentimenKeseluruhan}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Perkiraan Sentimen:</span> {sentimentData.persentaseSetuju}% Setuju | {sentimentData.persentaseTidakSetuju}% Tidak Setuju
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Tema Utama:</span> {sentimentData.temaUtama?.join(', ') || 'Tidak ada'}
                                    </p>
                                    <p className="text-sm italic text-gray-600 border-t pt-3 mt-3">
                                        "{sentimentData.ringkasanKualitatif}"
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">Data di-cache dari AI.</p>
                                </div>
                            ) : errorSentiment ? (
                                <p className="text-sm text-red-500 mt-2">{errorSentiment}</p>
                            ) : (
                                <p className="text-sm text-gray-500 mt-2">Belum ada analisis yang dilakukan.</p>
                            )}
                        </div>
                    )}
                    {/* === AKHIR KARTU ANALISIS SENTIMEN DISPLAY === */}
                    
                    {/* Ruang Aspirasi Warga (Comments Section) */}
                    
                    <div className="bg-white py- px-2 md:p-8 rounded-2xl shadow-lg space-y-6">

                        {/* Bagian Judul */}
                        <div className="space-y-2">
                            <h2 className="text-xl  font-bold text-slate-900">
                            Ruang Aspirasi Warga
                            </h2>
                            <p className="text-slate-500 text-xs">
                            Bagikan pendapat Anda, baca pandangan warga lain, dan ikut berdiskusi dengan sehat.
                            </p>
                        </div>
                        
                        {/* Form Input & Tombol */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input 
                            type="text" 
                            placeholder="Tuliskan aspirasi atau cari topik diskusi..." 
                            className="
                                w-full px-4 py-2 bg-slate-50 border border-red-800 text-slate-800
                                placeholder-slate-400 rounded-full
                                focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent
                                transition duration-300 ease-in-out
                            "
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <button 
                            type="submit"
                            disabled={!currentUser}
                            onClick={() => setIsDiscussion(true)}
                            aria-label="Kirim Aspirasi"
                            className="
                                flex items-center justify-center gap-2 w-full sm:w-auto text-xs flex-shrink-0
                                px-4 py-2 rounded-full bg-primary text-white font-semibold shadow-md
                                hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                                transition-all duration-300 ease-in-out transform hover:scale-105
                                disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                            "
                            >
                            <span>Berikan Aspirasi</span>
                            </button>
                        </div>
                        
                        {/* Bagian untuk menampilkan form diskusi (Modal/Component) */}
                        {policy && isDiscussion && (
                            <DiscussionForm
                                isOpen={isDiscussion}
                                onClose={() => setIsDiscussion(false)}
                                onPostCreated={fetchPosts} 
                                sourceType="policy"
                                sourceId={policy.id}
                                additionalData={{ type: policy.type }}
                            />
                        )}
                        
                        {/* Daftar Diskusi */}
                        <div className="space-y-4 pt-6 border-slate-200/80">
                            <PolicyDiscussionList 
                            sourceId={policy.id}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Voting */}
            <VotingModal 
                isOpen={isModalOpen}
                onClose={closeModal}
                policyTitle={policyData.title}
                policyId={policyId}
                onVoteSubmit={submitVote}
                loading={loadingVote}
                error={errorVote}
            />
        </MainLayout>
    );
};

export default PolicyDetail;
