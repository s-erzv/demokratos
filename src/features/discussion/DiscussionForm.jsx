// src/components/features/discussion/PolicyDiscussionForm.jsx

import { useState } from 'react';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from '../../firebase';
import { useAuth } from '../../hooks/AuthContext';
import { uploadDiscussionFile } from './discussionService';
import { X } from 'lucide-react';

// Komponen ini menerima props dari halaman detail kebijakan
const DiscussionForm = ({ isOpen, onClose, onDiscussionAdded, sourceType, sourceId, additionalData = {}, fileUrl ={} }) => {
  const { currentUser, userData } = useAuth();
  const [question, setQuestion] = useState('');
  const [body, setBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError("Judul aspirasi tidak boleh kosong.");
      return;
    }
    
    setLoading(true);
    setError('');
    
    console.log("Memulai handleSubmit...");
    console.log("Data yang diterima props:", { sourceType, sourceId, additionalData });

    try {
      let fileUrl = null;
      if (file) {
        fileUrl = await uploadDiscussionFile(file, currentUser.uid);
        if (!fileUrl) throw new Error("Gagal mengunggah file.");
      }

      const authorInfo = isAnonymous 
        ? { authorName: 'Anonim', authorPhotoURL: null }
        : { authorName: userData.fullName, authorPhotoURL: userData.photoURL || null };

      const keywords = question.toLowerCase().split(' ').filter(word => word !== "");

      // --- OBJEK DATA FINAL YANG BERSIH ---
      const dataToSave = {
        question, body, authorId: currentUser.uid, ...authorInfo,
        isAnonymous, createdAt: serverTimestamp(), likeCount: 0,
        commentCount: 0, keywords,
        
        // Menggunakan props yang generik
        sourceType: sourceType,
        sourceId: sourceId,
        ...additionalData, // Menyalin properti tambahan seperti { type: 'kebijakan' } atau { kategori: 'Pendidikan' }
        fileUrl: fileUrl,
      };

      // 1. Tambahkan dokumen diskusi baru
      await addDoc(collection(db, 'posts'), dataToSave);

      if (onDiscussionAdded) {
        onDiscussionAdded();
      }
      onClose();

      // 2. Update discussionCount di dokumen induk (policy atau laporan)
      const parentDocRef = doc(db, sourceType, sourceId);
      await updateDoc(parentDocRef, {
        discussionCount: increment(1)
      });
      
    } catch (err) {
      console.error("Error creating discussion:", err);
      setError(err.message || "Gagal memulai diskusi.");
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" 
      onClick={onClose}
    >
      {/* PENYESUAIAN KARTU: Dibuat lebih lebar (max-w-3xl) dan padding lebih besar */}
      <div 
        className='bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-3xl relative' 
        onClick={(e) => e.stopPropagation()}
      >
  
        {/* PENYESUAIAN JUDUL: Dibuat center, lebih besar, dan tombol X dihilangkan */}
        <h3 className="text-center text-3xl font-extrabold text-slate-900 mb-8">
          Buat Diskusi Baru
        </h3>
  
        {/* Form diberi jarak vertikal yang lebih lega (space-y-6) */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* FITUR BARU: Bagian Upload File */}
          {/* NOTE: Anda perlu menambahkan state dan handler untuk file upload ini */}
          {/* contoh: const [selectedFile, setSelectedFile] = useState(null); */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-medium text-slate-700 text-sm sm:text-base">{file ? file.name : 'Upload File (Opsional)'}</span>
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer text-sm font-semibold bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Pilih File
            </label>
            <input 
              id='file-upload'
               type='file'
               accept='.jpg, .jpeg, .png'
               onChange={(e) => setFile(e.target.files[0])}
              className="sr-only"
              // onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </div>
  
          {/* STYLE BARU: Input dan Textarea dibuat lebih lembut dan besar */}
          <input
            type="text"
            className="w-full px-5 py-4 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition"
            placeholder="Tulis judul diskusi, misal: Apakah gaji DPR perlu dinaikkan?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <textarea
            className="w-full px-5 py-4 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition min-h-[140px] resize-y"
            placeholder="Jelaskan topik atau pendapat awal Anda. Sertakan data, contoh kasus, atau alasan kenapa diskusi ini penting."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          
          {/* Kelompok Aksi di bagian bawah */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous-discussion"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-slate-400 text-primary focus:ring-primary mr-2"
              />
              <label htmlFor="anonymous-discussion" className="text-slate-600 select-none">
                Kirim sebagai Anonim
              </label>
            </div>
  
            {/* STYLE BARU: Tombol submit dibuat full-width dan lebih besar */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full px-8 py-3 bg-primary text-white text-lg font-semibold rounded-xl shadow-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Mengirim...' : 'Buat Diskusi'}
            </button>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default DiscussionForm;