// src/pages/ThreadDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import CommentCard from '../components/features/discussion/CommentCard';
import CreateCommentForm from '../components/features/discussion/CreateCommentForm';

const ThreadDetailPage = () => {
  const { postId } = useParams(); // Ambil ID dari URL
  const { currentUser } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchThreadDetails = async () => {
    try {
      // 1. Ambil data post utama
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        setError("Diskusi tidak ditemukan.");
        return;
      }
      setPost({ id: postSnap.id, ...postSnap.data() });

      // 2. Ambil data komentar dari sub-koleksi
      const commentsCollection = collection(db, 'posts', postId, 'comments');
      const q = query(commentsCollection, orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(q);
      const commentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
      }));
      setComments(commentsData);

    } catch (err) {
      console.error(err);
      setError("Gagal memuat data diskusi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchThreadDetails();
  }, [postId]);

  if (loading) return <p className="text-center mt-10">Memuat diskusi...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* --- KONTENER POST UTAMA (GAMBAR KEDUA BAGIAN ATAS) --- */}
      {post && (
        <div className="bg-white p-8 rounded-lg shadow-sm border mb-8">
          <div className="flex items-center mb-4">
            <img src={post.authorPhotoURL} alt={post.authorName} className="w-12 h-12 rounded-full mr-4" />
            <div>
              <p className="font-bold text-lg">{post.authorName}</p>
              {/* Di sini bisa tambahkan waktu post */}
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">{post.question}</h1>
          <p className="text-gray-800 whitespace-pre-wrap">{post.body}</p>
          <div className="flex items-center gap-4 text-gray-500 mt-6 pt-4 border-t">
            <span>👍 {post.likeCount} Suka</span>
            <span>💬 {post.commentCount} Balasan</span>
          </div>
        </div>
      )}

      {/* --- KONTENER BALASAN (GAMBAR KEDUA BAGIAN BAWAH) --- */}
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold mb-4">Semua Balasan</h2>
        
        {/* Form untuk menambah komentar baru */}
        <CreateCommentForm postId={postId} onCommentAdded={fetchThreadDetails} />
        
        {/* Daftar semua komentar */}
        {comments.length > 0 ? (
          comments.map(comment => <CommentCard key={comment.id} comment={comment} />)
        ) : (
          <p className="text-center text-gray-500 py-8">Belum ada balasan. Jadilah yang pertama!</p>
        )}
      </div>
    </div>
  );
};

export default ThreadDetailPage;