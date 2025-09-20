import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import { toggleLikePost } from './discussionService';
import { reportPost } from './discussionService';
import { formatTimeAgo } from '../../utils/formatters';
import { Heart, MessageCircle, Flag, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import ReportModal from './ReportModal';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import CreateCommentForm from './CreateCommentForm';

const PostCard = ({ post, onUpdate }) => {
  const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const { currentUser } = useAuth();
    const [isCommentInputVisible, setIsCommentInputVisible] = useState(false);

    useEffect(() => {
        if (currentUser) {
          const likeRef = doc(db, 'posts', post.id, 'likes', currentUser.uid);
          getDoc(likeRef).then(docSnap => {
            if (docSnap.exists()) {
              setIsLiked(true);
            }
          });
        }
      }, [post.id, currentUser]);

    const handleLikeClick = async (e) => {
      e.stopPropagation();
        if (!currentUser) {
        alert("Silakan masuk untuk menyukai post.");
        return;
        }
        const success = await toggleLikePost(post.id, currentUser.uid);
        if (success && onUpdate) {
        onUpdate(); // Panggil fungsi refresh dari parent
        }
    };

    const handleInteractionClick = (e) => {
      // Mencegah navigasi saat mengklik tombol di dalam kartu
      e.stopPropagation(); 
    };

    const handleCommentClick = (e) => {
      e.stopPropagation();
      setIsCommentInputVisible(prev => !prev); // Toggle tampilan input komen
    };

    const handleReportClick = async (e) => {
      e.stopPropagation();
      setIsReportModalOpen(true);
    };

    const handleCardClick = () => {
      navigate(`/diskusi/${post.id}`);
    };

      

    return (
        <div className="p-6 cursor-pointer" onClick={handleCardClick}>

        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
                {post.authorPhotoURL ? (
                    <img src={post.authorPhotoURL} alt={post.authorName} className="w-10 h-10 rounded-full mr-3" />
                ) : (
                    <UserCircle size={40} className="text-gray-400 mr-3" />
                )}
            
            <span className="font-semibold">{post.authorName}</span>
            </div>
            <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
        </div>


        <p className="text-gray-700 mb-4 line-clamp-2">{post.body}</p>
        
        <div className="flex items-center gap-4 text-gray-500">
            <button onClick={handleLikeClick} className="flex items-center gap-2 hover:text-red-500">
                <Heart 
                size={20} 
                className={isLiked ? 'text-red-500 fill-current' : ''} 
                />
                <span>{likeCount}</span>
            </button>

            <button onClick={handleCommentClick} className="flex items-center gap-2 hover:text-gray-300">
                <MessageCircle
                size={20} 
                className={isLiked ? 'text-gray-500 fill-current' : ''} 
                />
                <span>{post.commentCount}</span>
            </button>
            
            <button onClick={handleReportClick} className="hover:text-yellow-600">
                <Flag size={20} />
            </button>
        </div>

        <hr className='mt-5 bg-black'/>

        {isCommentInputVisible && (
          <div onClick={handleInteractionClick} className="mt-4">
            <CreateCommentForm postId={post.id} onCommentAdded={() => {
              setIsCommentInputVisible(false); // Tutup form setelah komen
              if (onUpdate) onUpdate(); // Refresh feed
            }}/>
          </div>
        )}

        <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)}
        postId={post.id}
        />

        </div>
    );
};

export default PostCard;