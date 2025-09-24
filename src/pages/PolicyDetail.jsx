// src/pages/PolicyDetail.jsx

import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/MainLayout';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase'; // db masih dibutuhkan untuk fetch data policy
import { doc, getDoc } from 'firebase/firestore'; // import yang relevan masih dipertahankan
import { Loader2, Users, Download, ArrowLeft, BarChart3, Search, Send } from 'lucide-react';
import VotingModal from '../components/VotingModal';
import { useVoting } from '../hooks/useVoting';
import { useAuth } from '../hooks/AuthContext';
import PolicyDiscussionList from '../features/discussion/PolicyDiscussionList';
import DiscussionForm from '../features/discussion/DiscussionForm';
import { usePolicy } from '../features/policy-voting/hooks/usePolicy'; // <-- 1. IMPORT HOOK BARU

const PolicyDetail = () => {
    const { policyId } = useParams();
    const navigate = useNavigate();
    const { currentUser, isAdmin } = useAuth();
    
    // 2. GUNAKAN HOOK usePolicy UNTUK MENGAMBIL STATE & FUNGSI
    const {
        sentimentReport,
        loadingAnalysis,
        showAnalysis,
        setShowAnalysis,
        analyzePolicySentiment
    } = usePolicy();

    // State lokal yang masih dibutuhkan
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [isDiscussion, setIsDiscussion] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshKey, setRefreshKey] = useState(0); // Untuk me-refresh diskusi

    // Hapus state lama yang sudah dipindah ke hook
    // const [sentimentReport, setSentimentReport] = useState(null);
    // const [loadingReport, setLoadingReport] = useState(false);
    // const [errorReport, setErrorReport] = useState(null);

    const checkUserVoteStatus = useCallback(async (id) => {
        if (!currentUser || !id) {
            setHasVoted(false);
            return;
        }
        try {
            const voteDocRef = doc(db, 'votes', `${currentUser.uid}_${id}`);
            const voteSnap = await getDoc(voteDocRef);
            setHasVoted(voteSnap.exists());
        } catch (err) {
            console.error("Gagal memeriksa status vote:", err);
            setHasVoted(false);
        }
    }, [currentUser]);

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
                if (currentUser) {
                    checkUserVoteStatus(docSnap.id);
                }
            } else {
                setError("Kebijakan tidak ditemukan.");
            }
        } catch (err) {
            setError("Gagal memuat detail kebijakan.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [policyId, currentUser, checkUserVoteStatus]);

    // Hapus fungsi fetchSentimentReport lama
    
    const triggerRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1); 
    };

    const handleRefetch = useCallback(() => {
        fetchPolicyData();
        setShowAnalysis(false); // <-- 3. Ganti dengan fungsi dari hook
    }, [fetchPolicyData, setShowAnalysis]);

    const {
        isModalOpen,
        openModal,
        closeModal,
        submitVote,
        loadingVote,
        errorVote
    } = useVoting(handleRefetch);

    useEffect(() => {
        fetchPolicyData();
    }, [fetchPolicyData]);


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
     
    if (!policy) {
        return (
            <MainLayout>
                <div className="text-center p-8">
                    <p>Kebijakan tidak ditemukan.</p>
                </div>
            </MainLayout>
        );
    }

    const policyData = policy;
    const votesYes = policyData.votesYes || 0;
    const votesNo = policyData.votesNo || 0;
    const totalVotes = votesYes + votesNo;
    const percentageYes = totalVotes > 0 ? ((votesYes / totalVotes) * 100).toFixed(1) : 50;
    
    const ParsedText = ({ text }) => {
        if (!text) return null;
        const parts = text.split(/(\*[^*]+\*)/g);
        return (
            <>
                {parts.map((part, index) => {
                    if (part.startsWith('*') && part.endsWith('*')) {
                        const innerText = part.substring(1, part.length - 1);
                        return <strong key={index}>{innerText}</strong>;
                    }
                    return <span key={index}>{part}</span>;
                })}
            </>
        );
    };

    return (
        <MainLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start justify-center">
                <div className="lg:col-span-2 space-y-6 lg:max-h-[95vh] lg:overflow-y-auto rounded-xl scrollbar-hide">
                    {/* ... (Konten detail kebijakan tidak berubah) ... */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="h-56 w-full rounded-xl overflow-hidden shadow-lg relative">
                            <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10" aria-label="Kembali">
                                <ArrowLeft size={24} />
                            </button>
                            <img src={policyData.thumbnailUrl} alt={policyData.title} className="w-full h-full object-cover" />
                        </div>
                        <span className="inline-block border border-primary bg-primary/10 mt-4 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                            {policyData.category}
                        </span>
                        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">{policyData.title}</h1>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed mb-6">{policyData.description}</p>
                        {policyData.documentUrl && (
                            <a href={policyData.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary font-semibold hover:text-red-800 transition-colors">
                                <Download size={20} className="mr-2" />
                                Download dokumen resmi
                            </a>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6 lg:max-h-[95vh] lg:overflow-y-auto rounded-xl scrollbar-hide">
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Hasil Voting Sementara</h2>
                        <div className="flex justify-center items-center h-32 w-32 mx-auto relative mb-6">
                            <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(#4CAF50 0% ${percentageYes}%, #F44336 ${percentageYes}% 100%)` }} />
                            <div className="absolute inset-4 bg-white rounded-full flex flex-col justify-center items-center">
                                <span className="text-xl font-extrabold text-primary">{percentageYes}%</span>
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
                        
                        {isAdmin ? (
                            <button
                                // 4. PANGGIL FUNGSI DARI HOOK
                                onClick={() => analyzePolicySentiment(policyId)}
                                disabled={loadingAnalysis || totalVotes === 0}
                                className="w-full py-3 bg-primary text-white font-bold rounded-full hover:bg-secondary transition-colors disabled:bg-gray-400 flex items-center justify-center"
                            >
                                {loadingAnalysis ? ( // 5. GUNAKAN STATE LOADING DARI HOOK
                                    <Loader2 size={20} className="mr-2 animate-spin" />
                                ) : (
                                    <>
                                        <BarChart3 size={20} className="mr-2" />
                                        Mulai Analisis Sentimen
                                    </>
                                )}
                            </button>
                        ) : (
                            <button onClick={openModal} disabled={hasVoted || !currentUser} className="w-full py-3 bg-primary text-white font-bold rounded-full hover:bg-red-800 transition-colors disabled:bg-gray-400">
                                {hasVoted ? 'Anda Sudah Berpartisipasi' : !currentUser ? 'Login untuk Berikan Suara' : 'Berikan Suara'}
                            </button>
                        )}
                    </div>
                    
                    {/* 6. GUNAKAN STATE DARI HOOK UNTUK MENAMPILKAN/MENYEMBUNYIKAN KARTU */}
                    {(isAdmin && showAnalysis) ? (
                        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                            <h2 className="text-xl font-bold text-primary border-b pb-3 flex items-center">
                                <BarChart3 size={20} className="mr-2" /> Laporan Sentimen
                            </h2>
                            {/* sentimentReport sekarang bisa berisi pesan sukses atau error */}
                            <div className="text-sm whitespace-pre-line text-left text-gray-700">
                                <div className="font-sans leading-relaxed p-3 bg-gray-50 rounded-lg whitespace-pre-wrap overflow-x-auto text-left">
                                    <ParsedText text={sentimentReport} />
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="bg-white py-3 px-2 md:p-8 rounded-2xl shadow-lg space-y-6">
                            <div className="space-y-2 pt-4 px-4 md:p-0">
                                <h2 className="text-xl font-bold text-slate-900">
                                    Ruang Aspirasi Warga
                                </h2>
                                <p className="text-slate-500 text-xs">
                                Bagikan pendapat Anda, baca pandangan warga lain, dan ikut berdiskusi dengan sehat.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            placeholder="Cari topik diskusi..."
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-300 text-slate-800 placeholder-slate-400 rounded-full focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition duration-300 ease-in-out text-sm"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!currentUser}
                                        onClick={() => setIsDiscussion(true)}
                                        aria-label="Kirim Aspirasi"
                                        className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm flex-shrink-0 px-4 py-2 rounded-full bg-primary text-white font-semibold shadow-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                    >
                                        <Send size={18} />
                                        <span>Buat</span>
                                    </button>
                                </div>
                            </div>
                            <hr className=''/>

                            {policy && isDiscussion && (
                                <DiscussionForm
                                    isOpen={isDiscussion}
                                    onClose={() => setIsDiscussion(false)}
                                    sourceId={policy.id}
                                    additionalData={{ 
                                        sourceType: "policy", 
                                        type: policy.type 
                                    }}
                                    onDiscussionAdded={triggerRefresh}
                                    sourceCollection="policies"
                                />
                            )}
                            <div className="space-y-4 border-slate-200/80">
                                <PolicyDiscussionList 
                                    sourceId={policy.id}
                                    searchTerm={searchTerm}
                                    refreshKey={refreshKey}
                                />    
                            </div>
                        </div>
                    )}      
                </div>
            </div>
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