import { useState } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import { reportPost } from './discussionService';

const ReportModal = ({ isOpen, onClose, post, userData }) => {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = [
    'Spam atau iklan',
    'Ujaran kebencian',
    'Informasi palsu (hoax)',
    'Konten tidak pantas',
    'Lainnya',
  ];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      return;
    }
    setLoading(true);

    const success = await reportPost(post, userData, reason);
    
    if (success) {
      alert("Laporan terkirim. Terima kasih.");
    } else {
      alert("Gagal mengirim laporan. Anda mungkin sudah pernah melaporkannya.");
    }

    setLoading(false);
    onClose(); 
  };

  if (!isOpen) return null;


  return (
    // Backdrop: Diberi efek blur untuk fokus yang lebih baik
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup (Opsional, tapi praktik yang baik) */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Tutup modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
  
        {/* Konten Modal */}
        <div className="space-y-2 mb-6">
          <h3 className="text-2xl font-bold text-slate-800">Laporkan Konten</h3>
          <p className="text-slate-500">Bantu kami menjaga komunitas tetap aman. Pilih alasan Anda melaporkan konten ini.</p>
        </div>
  
        <form onSubmit={handleSubmit}>
          {/* Pilihan Alasan (Radio Button yang di-restyle) */}
          <div className="space-y-3 mb-8">
            {reasons.map(r => (
              <label 
                key={r} 
                className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${reason === r ? 'bg-primary/10 border-primary shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <input 
                  type="radio" 
                  name="reason" 
                  value={r} 
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)} 
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300" 
                />
                <span className={`ml-3 font-medium ${reason === r ? 'text-primary' : 'text-slate-700'}`}>
                  {r}
                </span>
              </label>
            ))}
          </div>
  
          {/* Tombol Aksi */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={loading || !reason} // Tombol nonaktif jika belum ada alasan dipilih
              className="w-full py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-red-800 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;