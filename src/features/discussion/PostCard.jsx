import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import { toggleLikePost } from './discussionService';
import { reportPost } from './discussionService';
import { formatTimeAgo } from '../../utils/formatters';

const PostCard = ({ post, onUpdate }) => {
    const { currentUser } = useAuth();

    const handleLikeClick = async () => {
        if (!currentUser) {
        alert("Silakan masuk untuk menyukai post.");
        return;
        }
        const success = await toggleLikePost(post.id, currentUser.uid);
        if (success && onUpdate) {
        onUpdate(); // Panggil fungsi refresh dari parent
        }
    };

    const handleReportClick = async () => {
        if (!currentUser) {
          alert("Silakan masuk untuk melaporkan post.");
          return;
        }
        // Konfirmasi sebelum melaporkan
        if (window.confirm("Apakah Anda yakin ingin melaporkan diskusi ini?")) {
          await reportPost(post.id, currentUser.uid);
        }
      };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
            <img src={post.authorPhotoURL} alt={post.authorName} className="w-10 h-10 rounded-full mr-3" />
            <span className="font-semibold">{post.authorName}</span>
            </div>
            <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
        </div>
        <Link to={`/diskusi/${post.id}`} className="text-xl font-bold hover:underline mb-2 block">
            {post.question}
        </Link>
        <p className="text-gray-700 mb-4 line-clamp-2">{post.body}</p>
        
        <div className="flex items-center gap-4 text-gray-500">
            <button onClick={handleLikeClick} className="flex items-center gap-1">
                <span>👍</span> {post.likeCount}
            </button>

            <span>💬 {post.commentCount}</span>
            
            <button onClick={handleReportClick} title="Laporkan Diskusi">
                <span>🚩</span>
            </button>
        </div>
        </div>
    );
};

export default PostCard;