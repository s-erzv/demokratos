const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, loading, confirmText = "Ya, Lanjutkan" }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex justify-center items-center z-50 p-8 sm:p-4"
      onClick={onClose}
    >
      {/* Kartu Modal: Diberi style modern, padding responsif, dan layout vertikal */}
      <div 
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* IKON: Memberikan konteks visual (misalnya, bahaya/peringatan) */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        {/* Konten Teks: Tipografi yang lebih baik */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>

        {/* Tombol Aksi: Menggunakan grid untuk layout yang solid dan hierarki yang jelas */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2.5 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-2.5 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
          >
            {/* Menggunakan prop `confirmText` agar lebih dinamis */}
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;