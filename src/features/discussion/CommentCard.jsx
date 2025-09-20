import { formatTimeAgo } from "../../utils/formatters";
const formatTimeAgo = (timestamp) => {
    // Implementasi logika format waktu, misal menggunakan library 'date-fns'
    if (!timestamp) return 'beberapa saat lalu';
    // ... logika konversi ...
    return "2 jam lalu"; // Placeholder
};

const CommentCard = ({ comment }) => {
  return (
    <div className="border-t border-gray-200 py-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <img src={comment.authorPhotoURL} alt={comment.authorName} className="w-9 h-9 rounded-full mr-3" />
          <span className="font-semibold">{comment.authorName}</span>
        </div>
        <span className="text-sm text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
      </div>
      <p className="text-gray-800">{comment.text}</p>
      {/* Tombol Like, Reply, Report untuk komentar bisa ditambahkan di sini */}
    </div>
  );
};

export default CommentCard;