import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/MainLayout';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Loader2, Users, Download, ThumbsUp, ThumbsDown, Send, ArrowLeft } from 'lucide-react';
import VotingModal from '../components/VotingModal';
import { useVoting } from '../hooks/useVoting';
import { useAuth } from '../hooks/AuthContext';

const PolicyDetail = () => {
    const { policyId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [policy, setPolicy] = useState(null);
    const [comments, setComments] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentInput, setCommentInput] = useState('');
    
    // State baru untuk status voting pengguna
    const [hasVoted, setHasVoted] = useState(false);
    
    // FUNGSI UNTUK REFRESH DATA (dipanggil setelah vote sukses)
    const handleRefetch = useCallback(() => {
        fetchPolicyData();
        checkUserVoteStatus(policyId);
    }, [policyId]);

    const { 
        isModalOpen, 
        openModal, 
        closeModal, 
        submitVote, 
        loadingVote, 
        errorVote 
    } = useVoting(handleRefetch);
    
    // Fungsi baru untuk memeriksa status voting
    const checkUserVoteStatus = useCallback(async (id) => {
        if (!currentUser || !id) {
            setHasVoted(false);
            return;
        }

        try {
            // Gunakan konvensi nama dokumen yang sama dengan di server: {userId}_{policyId}
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
                
                // Panggil cek status voting setelah data policy didapatkan
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
    
    // Placeholder untuk fetch comments
    const fetchComments = useCallback(async (id) => {
        // TODO: Implementasi fetch comments
        setComments([]);
    }, []);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert("Anda harus login untuk berkomentar.");
            return;
        }
        if (commentInput.trim() === '') return;
        
        // TODO: Implementasi pengiriman komentar ke Firestore
        setCommentInput('');
    };

    useEffect(() => {
        fetchPolicyData();
    }, [fetchPolicyData]);

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

                {/* Kolom KANAN: Voting Widget & Aspirasi (1/3 lebar) */}
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

                        <button 
                            onClick={openModal} 
                            disabled={hasVoted || !currentUser}
                            className="w-full py-3 bg-primary text-white font-bold rounded-full hover:bg-red-800 transition-colors disabled:bg-gray-400"
                        >
                            {hasVoted ? 'Anda Sudah Berpartisipasi' : !currentUser ? 'Login untuk Berikan Suara' : 'Berikan Suara'}
                        </button>
                    </div>
                    
                    {/* Ruang Aspirasi Warga (Comments Section) */}
                    <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Ruang Aspirasi Warga</h2>
                        
                        {/* Input Komentar */}
                        <form onSubmit={handleCommentSubmit} className="flex space-x-2">
                            <input 
                                type="text"
                                placeholder={currentUser ? "Tulis Aspirasi Anda..." : "Login untuk berkomentar..."}
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                disabled={!currentUser}
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50"
                                required
                            />
                            <button 
                                type="submit"
                                disabled={!currentUser}
                                className="p-3 bg-primary text-white rounded-full hover:bg-red-800 transition-colors disabled:bg-gray-400"
                                aria-label="Kirim Aspirasi"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                        
                        {/* Daftar Komentar */}
                        <div className="space-y-4 pt-3">
                            {comments.map(comment => (
                                <div key={comment.id} className="border-b pb-3 last:border-b-0">
                                    <p className="text-sm font-semibold text-gray-800">{comment.author}</p>
                                    <p className="text-xs text-gray-500 mb-2">{comment.time}</p>
                                    <p className="text-gray-700 text-sm">{comment.text}</p>
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                        <button className="flex items-center hover:text-primary transition-colors">
                                            <ThumbsUp size={14} className="mr-1" /> {comment.likes || 0}
                                        </button>
                                        <button className="flex items-center hover:text-red-600 transition-colors">
                                            <ThumbsDown size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && !loading && <p className="text-sm text-gray-500">Belum ada aspirasi untuk kebijakan ini.</p>}
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