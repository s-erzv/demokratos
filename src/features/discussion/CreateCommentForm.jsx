// src/components/features/discussion/CreateCommentForm.jsx

import { useState } from 'react';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from '../../../firebase'; // Sesuaikan path
import { useAuth } from '../../../contexts/AuthContext'; // Sesuaikan path

const CreateCommentForm = ({ postId, onCommentAdded }) => {
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

    try {
      // 1. Tambahkan dokumen baru ke sub-koleksi 'comments'
      const commentsCollection = collection(db, 'posts', postId, 'comments');
      await addDoc(commentsCollection, {
        text: text,
        authorId: currentUser.uid,
        authorName: userData.fullName,
        authorPhotoURL: userData.photoURL,
        createdAt: serverTimestamp(),
        likeCount: 0
      });

      // 2. Update 'commentCount' di dokumen post utama
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
          commentCount: increment(1)
      });

      setText(''); // Kosongkan form
      onCommentAdded(); // Panggil fungsi untuk refresh daftar komentar

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
    <form onSubmit={handleSubmit} className="mt-6 mb-8">
      <textarea
        className="w-full p-3 border rounded-md"
        placeholder="Tulis balasan Anda..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows="4"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <button type="submit" disabled={loading} className="mt-3 px-6 py-2 bg-red-800 text-white font-semibold rounded-md">
        {loading ? 'Mengirim...' : 'Kirim Balasan'}
      </button>
    </form>
  );
};

export default CreateCommentForm;