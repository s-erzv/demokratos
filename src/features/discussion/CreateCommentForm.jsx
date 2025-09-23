import { useState } from 'react';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from '../../firebase';
import { useAuth } from '../../hooks/AuthContext';

const CreateCommentForm = ({ postId, parentCommentId = null, onCommentAdded }) => {
  const { currentUser, userData } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) {
      setError("Komentar tidak boleh kosong.");
      return;
    }

    setLoading(true);
    setError('');

    let path;
    let parentDocRef;

    const data = {
        text: text,
        authorId: currentUser.uid,
        authorName: userData.fullName,
        authorPhotoURL: userData.photoURL,
        createdAt: serverTimestamp(),
        likeCount: 0,
        replyCount: 0 // <-- Balasan baru selalu dimulai dengan 0 reply
    };

    if (parentCommentId) {
      // Jika ini adalah balasan untuk sebuah komentar
      path = collection(db, 'posts', postId, 'comments', parentCommentId, 'replies');
      parentDocRef = doc(db, 'posts', postId, 'comments', parentCommentId);
      data.parentCommentId = parentCommentId; // <-- SIMPAN ID INDUKNYA
    } else {
        // Jika ini adalah komentar level pertama
        path = collection(db, 'posts', postId, 'comments');
        parentDocRef = doc(db, 'posts', postId);
    }

    try {
      // 3. Gunakan variabel 'path' yang dinamis untuk menyimpan data
      await addDoc(path, data);

      // 4. Update count di dokumen induk yang sesuai
      if (parentCommentId) {
        // Increment 'replyCount' di dokumen komentar induk
        await updateDoc(parentDocRef, { replyCount: increment(1) });
      } else {
        // Increment 'commentCount' di dokumen post utama
        await updateDoc(parentDocRef, { commentCount: increment(1) });
      }

      setText(''); // Kosongkan form
      if (onCommentAdded) {
        onCommentAdded(); // Beritahu parent untuk refresh dan/atau menutup form
      }


    } catch (err) {
      console.error("Error adding comment: ", err);
      setError("Gagal mengirim komentar.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <p className="text-center p-4 bg-gray-100 rounded-md">Silakan <a href="/login" className="underline font-semibold">masuk</a> untuk berkomentar.</p>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      
      {/* 1. MENGGANTI TEXTAREA DENGAN INPUT
        - Menggunakan <input> biasa namun dengan padding (py-3) agar terlihat lebih tinggi.
        - Styling disesuaikan dengan form lain yang sudah kita buat (background lembut, border, dan ring saat focus).
      */}
      <input
        type="text"
        className="w-full px-5 py-3 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition"
        placeholder="Tulis balasan Anda..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
  
      {/* 2. BARIS AKSI (ACTION ROW)
        - Menggunakan Flexbox ('flex') untuk menyejajarkan pesan error dan tombol.
        - 'justify-between' mendorong pesan error ke kiri dan tombol ke kanan.
        - Dibuat responsif ('flex-col sm:flex-row') agar tombol berada di bawah pesan error pada layar mobile.
      */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-1">
        
        {/* Pesan Error (di sebelah kiri) */}
        <div className="w-full text-left">
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        
        {/* Tombol Kirim (di sebelah kanan) */}
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full sm:w-auto px-6 py-2 bg-primary text-white font-semibold rounded-full shadow-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? 'Mengirim...' : 'Kirim Balasan'}
        </button>
      </div>
    </form>
  );
};

export default CreateCommentForm;