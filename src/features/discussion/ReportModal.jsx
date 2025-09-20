// src/components/features/discussion/ReportModal.jsx

import { useState } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import { reportPost } from './discussionService';

const ReportModal = ({ isOpen, onClose, postId }) => {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      return;
    }
    setLoading(true);

    const success = await reportPost(postId, currentUser.uid, reason);
    
    if (success) {
      alert("Laporan terkirim. Terima kasih.");
    } else {
      alert("Gagal mengirim laporan. Anda mungkin sudah pernah melaporkannya.");
    }

    setLoading(false);
    onClose(); 
  };

  if (!isOpen) return null;

  const reasons = ["Mengandung SARA", "Ujaran Kebencian", "Informasi Palsu (Hoax)", "Spam"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Laporkan Diskusi</h3>
        <p className="mb-6 text-gray-600">Pilih alasan mengapa Anda melaporkan konten ini.</p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 mb-6">
            {reasons.map(r => (
              <label key={r} className="flex items-center">
                <input type="radio" name="reason" value={r} onChange={(e) => setReason(e.target.value)} className="mr-3" />
                {r}
              </label>
            ))}
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="w-full py-2 bg-gray-200 rounded-md">Batal</button>
            <button type="submit" disabled={loading} className="w-full py-2 bg-red-800 text-white rounded-md">{loading ? 'Mengirim...' : 'Kirim'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;