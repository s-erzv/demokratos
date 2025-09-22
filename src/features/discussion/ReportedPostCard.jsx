// src/components/features/discussion/ReportedPostCard.jsx

import { formatTimeAgo } from "../../utils/formatters";

const ReportedPostCard = ({ report, onActionTaken }) => {

  // Nanti, kita akan isi logika untuk fungsi-fungsi ini
  const handleDeletePost = async () => {
    if (window.confirm("Anda yakin ingin menghapus post ini? Aksi ini tidak bisa dibatalkan.")) {
      console.log("Menghapus post:", report.postId);
      // Panggil fungsi service untuk hapus post & laporan
      // onActionTaken(); // Refresh daftar laporan
    }
  };

  const handleDismissReport = async () => {
    if (window.confirm("Anda yakin ingin mengabaikan laporan ini?")) {
      console.log("Mengabaikan laporan:", report.id);
      // Panggil fungsi service untuk update status laporan
      // onActionTaken(); // Refresh daftar laporan
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg animate-fade-in">
      <div className="flex justify-between items-start text-xs text-yellow-800 mb-2">
        <p>
          Dilaporkan oleh **{report.reporterName}** <br/>
          Karena: <span className="font-bold">{report.reason}</span>
        </p>
        <span className="flex-shrink-0">{formatTimeAgo(report.createdAt)}</span>
      </div>

      {/* Konten post yang dilaporkan */}
      <div className="bg-white p-4 rounded-md border">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-semibold">{report.reportedPostAuthorName}</span>
          {report.isPostAnonymous && (
            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">Aslinya Anonim</span>
          )}
        </div>
        <h4 className="font-bold text-gray-800">{report.postQuestion}</h4>
        <p className="text-sm text-gray-600 line-clamp-2">{report.postBody}</p>
      </div>

      {/* Tombol Aksi untuk Admin */}
      <div className="flex gap-2 mt-3">
        <button onClick={handleDeletePost} className="text-xs bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700">
          Hapus Post
        </button>
        <button onClick={handleDismissReport} className="text-xs bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600">
          Abaikan Laporan
        </button>
      </div>
    </div>
  );
};

export default ReportedPostCard;