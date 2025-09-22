import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, Loader2 } from 'lucide-react';

const VotingModal = ({ isOpen, onClose, policyTitle, policyId, onVoteSubmit, loading, error }) => {
    const [voteChoice, setVoteChoice] = useState(null); // 'yes' atau 'no'
    const [reason, setReason] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!voteChoice) {
            alert("Harap pilih Setuju atau Tidak Setuju.");
            return;
        }
        
        onVoteSubmit(policyId, voteChoice, reason);
        // Reset state setelah submit jika sukses ditangani oleh parent
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                
                {/* Tombol Tutup */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
                    aria-label="Tutup Modal"
                >
                    <X size={24} />
                </button>

                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Beri Suara untuk: <span className="text-primary">{policyTitle}</span>
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Pilih dengan bijak, suara Anda penting untuk kebijakan ini.
                    </p>

                    {/* Pesan Error/Loading */}
                    {error && <p className="p-2 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">{error}</p>}

                    <form onSubmit={handleSubmit}>
                        
                        {/* Pilihan Voting (Setuju / Tidak Setuju) */}
                        <div className="flex gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setVoteChoice('yes')}
                                className={`flex-1 py-3 font-semibold rounded-full border-2 transition-all 
                                    ${voteChoice === 'yes' 
                                        ? 'bg-green-600 border-green-600 text-white' 
                                        : 'border-green-600 text-green-600 hover:bg-green-50'}`}
                            >
                                <ThumbsUp size={20} className="inline mr-2" /> Setuju
                            </button>
                            <button
                                type="button"
                                onClick={() => setVoteChoice('no')}
                                className={`flex-1 py-3 font-semibold rounded-full border-2 transition-all 
                                    ${voteChoice === 'no' 
                                        ? 'bg-red-600 border-red-600 text-white' 
                                        : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                            >
                                <ThumbsDown size={20} className="inline mr-2" /> Tidak Setuju
                            </button>
                        </div>

                        {/* Input Alasan */}
                        <textarea
                            placeholder="Ceritakan alasan Anda memilih opsi ini (opsional)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows="4"
                            className="w-full border border-gray-300 rounded-lg p-4 resize-none focus:outline-none focus:ring-1 focus:ring-primary mb-6"
                        />
                        
                        {/* Tombol Kirim Suara */}
                        <button
                            type="submit"
                            disabled={loading || !voteChoice}
                            className="w-full py-3 bg-primary text-white font-bold rounded-full hover:bg-red-800 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                        >
                            {loading ? (
                                <Loader2 size={20} className="mr-2 animate-spin" />
                            ) : 'Kirim Suara'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VotingModal;