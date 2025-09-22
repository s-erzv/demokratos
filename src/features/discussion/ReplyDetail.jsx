import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from '../../firebase'
import CommentCard from './CommentCard';
import CreateCommentForm from './CreateCommentForm';
import { useAuth } from '../../hooks/AuthContext';

const ReplyDetail = () => {
    const { postId, commentId } = useParams();
    const { currentUser } = useAuth();
    const [parentComment, setParentComment] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReplyFormVisible, setIsReplyFormVisible] = useState(false);

    const fetchRepliesAndParent = useCallback(async () => {
        if (!postId || !commentId) return;
        setLoading(true);

        try {
          // 1. Ambil data komentar induk
          const parentCommentRef = doc(db, 'posts', postId, 'comments', commentId);
          const parentCommentSnap = await getDoc(parentCommentRef);
          if (parentCommentSnap.exists()) {
            setParentComment({ id: parentCommentSnap.id, ...parentCommentSnap.data() });
          }
    
          // 2. Ambil semua balasannya
          const repliesPath = collection(db, 'posts', postId, 'comments', commentId, 'replies');
          const q = query(repliesPath, orderBy('createdAt', 'asc'));
          const snapshot = await getDocs(q);
          const repliesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setReplies(repliesData);
    
        } catch (error) {
          console.error("Gagal memuat balasan:", error);
        } finally {
          setLoading(false);
        }
      }, [postId, commentId]);
    
    useEffect(() => {
        fetchRepliesAndParent();
    }, [fetchRepliesAndParent]);

    
    
    if (loading) return <p className="text-center mt-10">Memuat balasan...</p>;

    return (
        <>
        <div className=" min-h-screen ">
          <div className="max-w-7xl ">
      
            {/* Container ini mengatur jarak antara dua kartu */}
            <div className="space-y-6">
      
              {/* 2. KARTU PERTAMA: Hanya untuk komentar induk. */}
              {parentComment && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80">
                  {/* Menggunakan padding yang konsisten */}
                  <div className="p-6 sm:p-8">
                    <CommentCard comment={parentComment} postId={postId} level={0} hideReplyButton={true} />
                    
                    {currentUser && (
                      <div className="flex items-end">
                        <button
                            onClick={() => setIsReplyFormVisible(prev => !prev)}
                            className="bg-primary ml-auto text-white font-semibold py-2 px-5 rounded-full hover:bg-red-800 transition-colors"
                            >
                            {isReplyFormVisible ? 'Batal' : 'Jawab Komentar Ini'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
      
              {/* FORM BALASAN: Ditampilkan di antara dua kartu jika aktif */}
              {isReplyFormVisible && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6 sm:p-8">
                  <CreateCommentForm 
                    postId={postId}
                    parentCommentId={commentId}
                    onCommentAdded={() => {
                      fetchRepliesAndParent();
                      setIsReplyFormVisible(false);
                    }}
                  />
                </div>
              )}
      
              {/* 3. KARTU KEDUA: Khusus untuk daftar balasan. */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80">
                <div className="p-6 sm:p-8">
                  <p className="text-sm font-bold text-slate-800 mb-6">Balasan</p>
                  
                  <div className="space-y-6">
                    {replies.length > 0 ? (
                      replies.map(reply => (
                        <div  className=" border-slate-100">
                          <CommentCard 
                            key={reply.id} 
                            comment={reply} 
                            postId={postId} 
                            level={1}
                          />
                        </div>
                      ))
                    ) : (
                      !isReplyFormVisible && (
                        <div className="text-center py-8">
                          <p className="text-slate-500">Belum ada balasan.</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
      
            </div>
          </div>
        </div>
        </>
      );
};

export default ReplyDetail;