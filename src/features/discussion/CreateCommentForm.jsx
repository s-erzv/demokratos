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