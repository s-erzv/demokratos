// src/components/features/discussion/ReportedPostCard.jsx

const ReportedPostCard = ({ report }) => {
    // Fungsi untuk menangani aksi admin (misal: hapus post)
    const handleDeletePost = () => {
      // Logika untuk menghapus post dari koleksi 'posts'
      console.log("Menghapus post:", report.postId);
    };
  
    const handleDismissReport = () => {
      // Logika untuk mengubah status laporan menjadi 'dismissed'
      console.log("Mengabaikan laporan untuk post:", report.postId);
    };
  
    return (
      <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
        <p className="text-sm text-yellow-800 mb-2">
          Dilaporkan oleh **{report.reporterName}** karena: <span className="font-bold">{report.reason}</span>
        </p>
        <div className="bg-white p-4 rounded-md">
          <div className="flex items-center gap-3 mb-2">
            {/* Di sini kamu bisa fetch foto profil penulis asli jika perlu */}
            <span className="font-semibold">{report.reportedPostAuthorName}</span>
            {report.isPostAnonymous && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">Anonim</span>}
          </div>
          <h4 className="font-bold">{report.postQuestion}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{report.postBody}</p>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={handleDeletePost} className="text-xs bg-red-600 text-white px-3 py-1 rounded-md">Hapus Post</button>
          <button onClick={handleDismissReport} className="text-xs bg-gray-500 text-white px-3 py-1 rounded-md">Abaikan Laporan</button>
        </div>
      </div>
    );
  };
  
  export default ReportedPostCard;