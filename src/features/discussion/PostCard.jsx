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

const Badge = ({ sourceType, type }) => {
  let text = '';
  let bgColor = 'bg-gray-200';
  let textColor = 'text-gray-800';

  if (sourceType === 'policy') {
    if (type === 'kebijakan') {
      text = 'Kebijakan';
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
    } else if (type === 'program') {
      text = 'Program';
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
    }
  } else if (sourceType === 'laporan') {
    text = 'Laporan';
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
  }

  if (!text) return null; // Jangan render apa-apa jika tipe tidak dikenali

  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${bgColor} ${textColor}`}>
      {text}
    </span>
  );
};

const PostCard = ({ post, onUpdate }) => {

  const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const { currentUser } = useAuth();
    const [isLiking, setIsLiking] = useState(false);

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
      if (!currentUser || isLiking) return;
      setIsLiking(true);
      
      setIsLiked(prev => !prev);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

      // Panggil fungsi inti untuk update data di Firestore
      const success = await toggleLikePost(post.id, currentUser.uid);

      if (!success) {
        // Jika gagal, kembalikan UI ke state semula
        setIsLiked(prev => !prev);
        setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
        alert("Gagal memperbarui status 'like'.");
      }

      setIsLiking(false);
    };

    const handleInteractionClick = (e) => {
      // Mencegah navigasi saat mengklik tombol di dalam kartu
      e.stopPropagation(); 
    };

    const handleReportClick = async (e) => {
      e.stopPropagation();
      setIsReportModalOpen(true);
    };

    const handleCardClick = () => {
      navigate(`/diskusi/${post.id}`);
    };

      

    return (
      <div className="">
        
        {/* STRUKTUR DIUBAH: Kembali ke layout satu kolom untuk konten utama,
            dengan baris atas khusus untuk info penulis dan waktu. */}
    
        {/* BAGIAN ATAS: Menggabungkan info penulis dan waktu */}
        <div className="flex justify-between items-start mb-4 mt-7">
          
          {/* KIRI: Foto dan Nama sekarang berdampingan sebagai satu grup */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={handleCardClick}
          >
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
          
          {/* KANAN: Waktu tetap di pojok kanan, terpisah dari alur konten */}
          <span className="text-xs text-slate-400 flex-shrink-0 ml-4">{formatTimeAgo(post.createdAt)}</span>
        </div>
    
        {/* BAGIAN TENGAH: Badge, Judul, dan Body dalam satu alur vertikal */}
        <div 
          className="space-y-3 cursor-pointer"
          onClick={handleCardClick}
        >
          <Badge sourceType={post.sourceType} type={post.type} />
    
          <h2 className="text-lg font-bold text-slate-800 break-words">
            {post.question}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">{post.body}</p>
        </div>
    
        {/* BAGIAN BAWAH: Tombol Aksi (Struktur tetap sama, di bawah konten) */}
        <div className="mt-4 flex items-center gap-4 sm:gap-6 text-slate-500">
          <button onClick={handleLikeClick} disabled={!currentUser || isLiking} className="flex items-center gap-2 text-xs hover:text-red-500 transition-colors disabled:opacity-50">
            <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} stroke={isLiked ? '#ef4444' : 'currentColor'} />
            <span className={isLiked ? 'text-red-500 font-semibold' : ''}>{likeCount}</span>
          </button>
    
          <Link 
            to={`/diskusi/${post.id}`} 
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-xs hover:text-blue-500 transition-colors"
          >
            <MessageCircle size={16} />
            <span>{post.commentCount}</span>
          </Link>
          
          <button onClick={handleReportClick} className="flex items-center gap-2 text-xs hover:text-yellow-600 transition-colors" aria-label="Laporkan postingan">
            <Flag size={16} />
          </button>
        </div>

        <hr className='h-1 mt-4'/>
    
        {/* Modal Laporan (tidak ada perubahan) */}
        <ReportModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)}
          postId={post.id}
        />
      </div>
    );
};

export default PostCard;