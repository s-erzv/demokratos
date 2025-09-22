// src/components/features/discussion/PolicyDiscussionForm.jsx

import { useState } from 'react';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from '../../firebase';
import { useAuth } from '../../hooks/AuthContext';
import { X } from 'lucide-react';

// Komponen ini menerima props dari halaman detail kebijakan
const PolicyDiscussion = ({ isOpen, onClose, onPostCreated, policyId, policyType }) => {
  const { currentUser, userData } = useAuth();
  
  const [question, setQuestion] = useState('');
  const [body, setBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError("Judul diskusi tidak boleh kosong.");
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Menentukan data author berdasarkan pilihan anonim
      const authorInfo = isAnonymous 
        ? { authorName: 'Anonim', authorPhotoURL: null }
        : { authorName: userData.fullName, authorPhotoURL: userData.photoURL || null };

      // Membuat array keywords untuk fitur pencarian nanti
      const keywords = question.toLowerCase().split(' ').filter(word => word !== "");

      // 1. TAMBAHKAN DOKUMEN BARU KE KOLEKSI 'posts'
      await addDoc(collection(db, 'posts'), {
        // Data diskusi
        question,
        body,
        authorId: currentUser.uid,
        ...authorInfo,
        isAnonymous,
        createdAt: serverTimestamp(),
        likeCount: 0,
        commentCount: 0,
        keywords,

        // --- DATA PENGHUBUNG ANTAR FITUR ---
        sourceType: "policy",
        sourceId: policyId,      // ID dari kebijakan induk
        type: policyType     // Jenisnya: 'kebijakan' atau 'program'
      });

      if (onPostCreated) onPostCreated();
      onClose();
    } catch (err) {
      console.error("Error creating discussion:", err);
      setError("Gagal memulai diskusi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };
  
  if (!currentUser) {
    return <p className="text-center p-4 bg-gray-100 rounded-md">Silakan <a href="/signin" className="underline font-semibold">masuk</a> untuk memulai diskusi.</p>;
  }

  if (!isOpen) return null;

  return (
    <div 
    className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" 
    onClick={onClose}
  >
    {/* Modal Card: 
      - Padding responsif ('p-6 md:p-8') dan sudut lebih bulat ('rounded-2xl').
      - Animasi sederhana dapat ditambahkan dengan mengatur opacity dan scale saat komponen mount.
    */ }
    <div 
      className='bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-2xl relative' 
      onClick={(e) => e.stopPropagation()}
    >

      {/* Tombol Tutup (Close Button): 
        - Dibuat melingkar dengan 'rounded-full' dan diberi background saat hover untuk feedback yang lebih jelas.
      */}
      <button 
        onClick={onClose} 
        className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Tutup modal"
      >
        <X size={22} />
      </button>

      {/* Judul: Ukuran dan warna teks diperbarui untuk hierarki yang lebih baik. */}
      <h3 className="font-bold text-2xl text-slate-800 mb-6">Mulai Diskusi Baru</h3>

      {/* Form: Diberi 'space-y-4' agar jarak antar elemen form konsisten. */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input & Textarea: Diberi style modern dengan background lembut dan efek ring saat focus. */}
        <input
          type="text"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          placeholder="Tulis judul diskusimu..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <textarea
          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition min-h-[120px] resize-y"
          placeholder="Jelaskan pendapat awal Anda..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {/* Area Aksi (Actions): 
          - Dibuat responsif: 'flex-col-reverse' di mobile (tombol di atas), 'sm:flex-row' di desktop.
          - 'gap-4' untuk spasi yang rapi.
        */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center w-full sm:w-auto">
            {/* Checkbox: Diberi warna aksen agar serasi dengan tema. */}
            <input
              type="checkbox"
              id="anonymous-discussion"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-slate-400 text-red-700 focus:ring-red-600 mr-2"
            />
            <label htmlFor="anonymous-discussion" className="text-slate-600 select-none">
              Kirim sebagai Anonim
            </label>
          </div>
          {/* Tombol Submit: 
            - Diberi style lebih modern, efek hover, dan state disabled yang jelas.
            - Dibuat full-width di mobile ('w-full') dan auto di desktop ('sm:w-auto').
          */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full sm:w-auto px-8 py-3 bg-red-800 text-white font-semibold rounded-lg shadow-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800 transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Mengirim...' : 'Kirim Diskusi'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm text-right mt-2">{error}</p>}
      </form>
    </div>
  </div>
  );
};

export default PolicyDiscussion;