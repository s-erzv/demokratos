// src/components/CreatePostModal.jsx

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext'; // Sesuaikan path jika perlu

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { currentUser, userData } = useAuth(); // Gunakan AuthContext!
  
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
        const authorInfo = isAnonymous 
            ? { authorName: 'Anonim', authorPhotoURL: '/default-avatar.png' } // Sediakan gambar avatar anonim
            : { authorName: userData.fullName, authorPhotoURL: userData.photoURL };

        await addDoc(collection(db, 'posts'), {
            question,
            body,
            authorId: currentUser.uid,
            ...authorInfo,
            isAnonymous,
            createdAt: serverTimestamp(),
            likeCount: 0,
            commentCount: 0,
            // Kategori dan file upload bisa ditambahkan di sini
        });

        const keywords = question
            .toLowerCase() // 1. Ubah judul menjadi huruf kecil
            .split(' ')      // 2. Pecah menjadi array kata-kata
            .filter(word => word !== ""); // 3. Hapus kata kosong jika ada spasi ganda

            await addDoc(collection(db, 'posts'), {
            question,
            body,
            authorId: currentUser.uid,
            ...authorInfo,
            isAnonymous,
            createdAt: serverTimestamp(),
            likeCount: 0,
            commentCount: 0,
            keywords: keywords // <- 4. Simpan array keywords ke Firestore
        });

        // Reset form dan tutup modal
        setQuestion('');
        setBody('');
        setIsAnonymous(false);
        onPostCreated(); // Panggil fungsi ini untuk refresh feed
        onClose();

    } catch (err) {
      console.error("Error creating post:", err);
      setError("Gagal membuat diskusi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };
  
  // Jika modal tidak terbuka, jangan render apa-apa
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">Buat Diskusi Baru</h2>
        
        {/* Di sini kamu bisa tambahkan input Kategori & Upload File */}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full p-3 border rounded-md mb-4"
            placeholder="Tulis judul diskusi, misal: Apakah gaji DPR perlu dinaikkan?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <textarea
            className="w-full p-3 border rounded-md mb-4 h-32"
            placeholder="Jelaskan topik atau pendapat awal Anda..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="anonymous">Kirim sebagai Anonim</label>
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          
          <button type="submit" disabled={loading} className="w-full bg-red-800 text-white p-3 rounded-md font-bold">
            {loading ? 'Mengirim...' : 'Buat Diskusi'}
          </button>
          <button type="button" onClick={onClose} className="w-full mt-2 text-gray-600 p-2">
            Batal
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;