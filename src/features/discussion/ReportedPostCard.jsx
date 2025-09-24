import { formatTimeAgo } from "../../utils/formatters";
import { UserCircle } from "lucide-react";
import ConfirmationModal from "../../components/styling/confirmationModal";
import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from "../../hooks/AuthContext";

const ReportedPostCard = ({ report, onActionTaken}) => {
  const { currentUser, isAdmin } = useAuth();

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: ''
  });
  const [loadingAction, setLoadingAction] = useState(false);

  // Fungsi yang akan dijalankan saat admin konfirmasi HAPUS POST
  const confirmDeletePost = async () => {
    if (!currentUser) {
      alert("Sesi pengguna tidak ditemukan. Silakan login ulang.");
      setIsDeleting(false);
      setIsConfirmModalOpen(false);
      return;
    }

    setLoadingAction(true);
    try {
      if (!currentUser) throw new Error("Sesi tidak ditemukan. Harap login ulang.");
      await currentUser.getIdToken(true);

      const functions = getFunctions();
      const deletePostCallable = httpsCallable(functions, 'deletePost');
      await deletePostCallable({ postId: report.postId });
      if (onActionTaken) onActionTaken();
    } catch (error) {
      console.error("Error menghapus post:", error);
      alert(`Gagal menghapus post: ${error.message}`);
    } finally {
      setLoadingAction(false);
      setModalState({ isOpen: false });
    }
  };

  const confirmDismissReport = async () => {
    if (!currentUser) {
      alert("Sesi pengguna tidak ditemukan. Silakan login ulang.");
      setIsDeleting(false);
      setIsConfirmModalOpen(false);
      return;
    }
    
    setLoadingAction(true);
    try {
      if (!currentUser) throw new Error("Sesi tidak ditemukan. Harap login ulang.");
            await currentUser.getIdToken(true);

      const functions = getFunctions();
      const dismissReportCallable = httpsCallable(functions, 'dismissReport');
      await dismissReportCallable({ reportId: report.id });
      if (onActionTaken) onActionTaken(); // Refresh daftar laporan
    } catch (error) {
      console.error("Gagal mengabaikan laporan:", error);
      alert(`Gagal mengabaikan laporan: ${error.message}`);
    } finally {
      setLoadingAction(false);
      setModalState({ isOpen: false });
    }
  };
  
  const handleDeletePost = () => {
    setModalState({
      isOpen: true,
      title: "Hapus Postingan Ini?",
      message: "Aksi ini akan menghapus postingan secara permanen.",
      onConfirm: confirmDeletePost,
      confirmText: "Ya, Hapus Post"
    });
  };

  const handleDismissReport = () => {
    setModalState({
      isOpen: true,
      title: "Abaikan Laporan Ini?",
      message: "Laporan ini akan dihapus dari daftar. Postingan asli tidak akan terpengaruh.",
      onConfirm: confirmDismissReport,
      confirmText: "Ya, Abaikan"
    });
  };

  return (
    <>
    <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg animate-fade-in">
      <div className="flex justify-between items-start text-xs text-yellow-800 mb-3">
        <p>
          Dilaporkan oleh {report.reporterName} <br/>
          Karena: <span className="font-bold">{report.reason}</span>
        </p>
        <span className="flex-shrink-0">{formatTimeAgo(report.createdAt)}</span>
      </div>
  
      <div className="bg-red-200/40 p-3 sm:p-4 rounded-md border border-red-500 space-y-2">
        
        {/* Info Penulis Post */}
        <div className="flex items-center gap-2">
          {report.reportedPostAuthorPhotoURL ? (
              <img 
                src={report.reportedPostAuthorPhotoURL} 
                alt={report.reportedPostAuthorName} 
                className="w-6 h-6 rounded-full object-cover" 
              />
            ) : (
              <UserCircle size={24} className="text-yellow-700/80" />
          )}
          <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-yellow-900">{report.reportedPostAuthorName}</span>
              {report.isPostAnonymous && (
                <span className="text-xs bg-yellow-200/80 text-yellow-900 px-2 py-0.5 rounded-full font-medium">Aslinya Anonim</span>
              )}
          </div>
        </div>
        
        {/* Isi Postingan yang Dilaporkan */}
        <div className="pl-8"> {/* Diberi indentasi agar lurus dengan nama */}
          <h4 className="font-bold text-yellow-900">{report.postQuestion}</h4>
          <p className="text-sm text-yellow-800/90 line-clamp-2">{report.postBody}</p>
        </div>
      </div>
  
      <div className="flex gap-3 mt-3">
        <button onClick={handleDeletePost} disabled={loadingAction} className="text-xs font-bold bg-red-600 text-white px-4 py-1.5 rounded-full hover:bg-red-700 transition-colors">
          {loadingAction ? '...' : 'Hapus Post'}
        </button>
        <button onClick={handleDismissReport} disabled={loadingAction} className="text-xs font-semibold bg-slate-500 text-white px-4 py-1.5 rounded-full hover:bg-slate-600 transition-colors">
          {loadingAction ? '...' : 'Abaikan Laporan'}
        </button>
      </div>
    </div>

    <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false })}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        loading={loadingAction}
    />
    </>
  );
};

export default ReportedPostCard;