
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from '../../firebase'
import CommentCard from './CommentCard';
import CreateCommentForm from './CreateCommentForm';
import { useAuth } from '../../hooks/AuthContext';
import { Heart, MessageCircle, Flag, UserCircle } from 'lucide-react';
import { toggleLikePost } from './discussionService'; 
import ReportModal from './ReportModal';
import { formatTimeAgo } from '../../utils/formatters';

const ThreadDetail = () => {
  const { currentUser } = useAuth();
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCommentFormVisible, setIsCommentFormVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const fetchThreadDetails = useCallback (async () => {
      // Penjaga: jangan fetch jika tidak ada ID
      if (!postId) {
        setLoading(false);
        setError("ID Diskusi tidak valid.");
        return;
      }

      setLoading(true);
      setError('');
      try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          setPost({ id: postSnap.id, ...postSnap.data() });

          const commentsCollection = collection(db, 'posts', postId, 'comments');
          const q = query(commentsCollection, orderBy('createdAt', 'asc'));
          const querySnapshot = await getDocs(q);
          const commentsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setComments(commentsData);
        } else {
          setError("Diskusi tidak ditemukan.");
        }
      } catch (err) {
        console.error("Gagal memuat detail:", err);
        setError("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    }, [postId]);

  useEffect(() => {
      fetchThreadDetails();
  }, [fetchThreadDetails]);


  useEffect(() => {
    if (!loading && post) {
      if (comments.length === 0) {
          // Jika tidak ada komentar, otomatis tampilkan form
          setIsCommentFormVisible(true);
      } else {
          // Jika ada komentar, sembunyikan form (default)
          setIsCommentFormVisible(false);
      }
    }
  }, [loading, post, comments]);

  useEffect(() => {
    if (post) {
        // Update likeCount lokal saat data post berubah
        setLikeCount(post.likeCount);
    }
    if (currentUser && post) {
        // Cek apakah user saat ini sudah me-like post ini
        const likeRef = doc(db, 'posts', post.id, 'likes', currentUser.uid);
        getDoc(likeRef).then(docSnap => {
            setIsLiked(docSnap.exists());
        });
    }
  }, [post, currentUser]);

  const handleNewComment = () => {
    // Panggil fungsi utama untuk me-refresh semua data di halaman ini
    fetchThreadDetails();
    // Tutup form komentar setelah berhasil
    setIsCommentFormVisible(false);
  };

  const handleLikeClick = async () => {
    if (!currentUser || isLiking) return;
    setIsLiking(true);

    // Optimistic Update
    setIsLiked(prev => !prev);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    const success = await toggleLikePost(post.id, currentUser.uid);

    if (!success) { // Rollback jika gagal
        setIsLiked(prev => !prev);
        setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
        alert("Gagal memperbarui status 'like'.");
    }
    setIsLiking(false);
  };

const handleReportClick = () => {
    if (!currentUser) {
        alert("Silakan masuk untuk melaporkan.");
        return;
    }
    setIsReportModalOpen(true);
};

  if (loading) return <p className="text-center mt-10">Memuat diskusi...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    // 1. KONTENER INDUK: Tetap menggunakan layout full-width yang responsif.
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto ">
        
        {/* Container ini mengatur jarak antara dua kartu */}
        <div className="space-y-6">
  
          {post && (
            // 2. KARTU PERTAMA: Hanya untuk post utama.
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80">
              <div className="p-6 sm:py-8 sm:px-12">
                
                {/* BAGIAN ATAS: Info Penulis & Waktu (Sesuai contoh) */}
                <div className="flex justify-between items-start mb-4">
                  {/* Kiri: Foto dan Nama berdampingan */}
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {post.authorPhotoURL ? (
                        <img 
                          src={post.authorPhotoURL} 
                          alt={post.authorName} 
                          className="w-10 h-10 rounded-full object-cover" 
                        />
                      ) : (
                        <UserCircle size={40} className="text-slate-400" />
                      )}
                    </div>
                    <span className="font-semibold text-slate-800">{post.authorName}</span>
                  </div>
                  
                  {/* Kanan: Waktu tetap di pojok kanan */}
                  <span className="text-xs text-slate-400 flex-shrink-0 ml-4">{formatTimeAgo(post.createdAt)}</span>
                </div>

                {/* BAGIAN TENGAH: Badge, Judul, dan Body (indentasi pl-[60px] dihilangkan) */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-900 break-words">{post.question}</h2>
                  <p className="text-slate-600 leading-relaxed">{post.body}</p>
                </div>
                
                {/* BAGIAN BAWAH: Tombol Aksi & Tombol Jawab (indentasi pl-[60px] dihilangkan) */}
                <div className="mt-1 flex justify-between items-center">
                  {/* Kiri: Suka, Jumlah Balasan */}
                  <div className="flex items-center gap-6 text-slate-500">
                    <button onClick={handleLikeClick} disabled={!currentUser || isLiking} className="flex items-center gap-2 text-sm hover:text-red-500 transition-colors disabled:opacity-50">
                      <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} stroke={isLiked ? '#ef4444' : 'currentColor'} />
                      <span className={isLiked ? 'text-red-500 font-semibold' : ''}>{likeCount}</span>
                    </button>
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle size={18} />
                      <span>{post.commentCount}</span>
                    </div>
                  </div>
                </div>

                <div className='flex justify-end items-end'>
                  {/* Kanan: Tombol Jawab Diskusi tetap ada */}
                  {!isCommentFormVisible && currentUser && (
                    <button
                      onClick={() => setIsCommentFormVisible(true)}
                      className="bg-primary ml-auto text-white font-semibold py-2 px-5 rounded-full hover:bg-red-800 transition-colors"
                    >
                      Jawab Diskusi
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
  
          {/* 3. KARTU KEDUA: Khusus untuk bagian balasan. */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80">
            <div className="p-6 sm:py-8 sm:px-12">
              <p className="text-sm font-bold text-slate-800 mb-5">Balasan </p>
  
              <div className="space-y-6">
                {isCommentFormVisible && (
                  <CreateCommentForm 
                    postId={postId} 
                    onCommentAdded={handleNewComment}
                  />
                )}
  
                {comments.length > 0 ? (
                  // Setiap balasan akan memiliki pemisah
                  comments.map(comment => (
                    <div key={comment.id} className=" border-slate-100   last:pb-0">
                      <CommentCard comment={comment} postId={postId} />
                    </div>
                  ))
                ) : (
                  !isCommentFormVisible && (
                    <div className="text-center py-8">
                      <p className="text-slate-500">Belum ada balasan. Jadilah yang pertama!</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
  
        </div>
  
        <ReportModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)}
          postId={post?.id}
        />
      </div> 
    </div>
  );
};

export default ThreadDetail;