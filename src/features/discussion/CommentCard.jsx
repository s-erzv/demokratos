import { formatTimeAgo } from "../../utils/formatters";
import { Heart, MessageCircle, Flag, UserCircle } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/AuthContext";
import CreateCommentForm from "./CreateCommentForm";
import ReportModal from './ReportModal';
import { toggleCommentLike, toggleReplyLike } from "./discussionService";


const CommentCard = ({ comment, postId, level = 0, hideReplyButton = false}) => {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount);

  const [isLiking, setIsLiking] = useState(false);
  

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  if (!comment) {
    return null; // Jika data comment belum siap, jangan render apa-apa
  }

  useEffect(() => {
    // Cek status 'like' awal, path ini sudah benar
    if (currentUser && postId && comment.id) {
      const likeRef = doc(db, 'posts', postId, 'comments', comment.id, 'likes', currentUser.uid);
      getDoc(likeRef).then(docSnap => {
        if (docSnap.exists()) setIsLiked(true);
      });
    }
  }, [postId, comment.id, currentUser]);


  const handleLikeClick = async () => {
    if (!currentUser || isLiking) return;

    setIsLiking(true);

    console.log("Mencoba me-like dengan data:", {
      postId: postId,
      commentId: comment.id,
      userId: currentUser.uid
    });

    // Optimistic Update
    setIsLiked(prev => !prev);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    let success = false;
    
    // --- LOGIKA PEMILIHAN FUNGSI ---
    if (comment.parentCommentId) {
      // Jika 'parentCommentId' ada, berarti ini adalah sebuah BALASAN
      success = await toggleReplyLike(postId, comment.parentCommentId, comment.id, currentUser.uid);
    } else {
      // Jika tidak ada, ini adalah KOMENTAR biasa
      success = await toggleCommentLike(postId, comment.id, currentUser.uid);
    }

    if (!success) { // Rollback jika gagal
      setIsLiked(prev => !prev);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      alert("Gagal memperbarui status 'like'.");
    }

    setIsLiking(false);
  };

  const handleReportClick = async (e) => {
    e.stopPropagation();
    setIsReportModalOpen(true);
  };

  const handleCardClick = () => {
    navigate(`/diskusi/${post.id}`);
  };  

  if (!comment) return null;

  return (
    <div style={{ marginLeft: `${level * 24}px` }} className="border-gray-200 pb-2">
      {level > 0 }

      <div className="">

        <div className="flex justify-between items-start mb-4">

          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              {comment.authorPhotoURL ? (
                <img 
                  // PERBAIKAN: Menggunakan variabel 'comment' yang benar, bukan 'post'
                  src={comment.authorPhotoURL} 
                  alt={comment.authorName} 
                  className="w-10 h-10 rounded-full object-cover" 
                />
              ) : (
                <UserCircle size={35} className="text-slate-400" />
              )}
            </div>
            <span className="font-semibold text-sm text-slate-800">
              {comment.authorName}
            </span>
          </div>

          <span className="text-xs text-slate-400 flex-shrink-0 ml-4">
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>

      <div className="flex-1 min-w-0">

        <div className="mt-1">
          <p className="text-slate-600 text-sm leading-relaxed break-words">
            {comment.text}
          </p>
        </div>

      </div>
    </div>


      
      <div className="flex items-center gap-6 text-gray-500 mt-4">
        {/* Tombol Like */}
        <button onClick={handleLikeClick} disabled={!currentUser || isLiking} className="flex items-center gap-2 group disabled:opacity-50">
          <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} stroke={isLiked ? '#ef4444' : 'currentColor'} className="text-gray-500 group-hover:text-red-500" />
          <span className={`group-hover:text-red-500 ${isLiked ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>{likeCount}</span>
        </button>

        {level < 1 && !hideReplyButton && (
          <Link 
            to={`/diskusi/${postId}/comment/${comment.id}`} 
            className="flex items-center gap-1 hover:underline"
          >
            <MessageCircle size={16} />
            {comment.replyCount > 0 ? `${comment.replyCount} Balasan` : 'Balas'}
          </Link>
        )}

        {/* Tombol Report */}
        <button onClick={handleReportClick} className="hover:text-yellow-600">
          <Flag size={20} />
        </button>
      </div>

      <hr className="h-1 mt-4"/>

      

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)}
        // Kirim detail yang relevan, misal postId dan commentId
        postId={postId}
        commentId={comment.id} 
      />

      
    </div>
  );
};

export default CommentCard;