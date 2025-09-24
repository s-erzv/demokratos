// src/components/features/discussion/AdminReportFeed.jsx

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import ReportedPostCard from './ReportedPostCard';

const AdminReportFeed = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const reportsRef = collection(db, 'reports');
      // Ambil semua laporan yang statusnya masih 'pending'
      const q = query(reportsRef, where("status", "==", "pending"), orderBy("createdAt", "asc"));
      
      const snapshot = await getDocs(q);
      const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(reportsData);
    } catch (error) {
        console.error("Gagal memuat laporan:", error);
        // Error di sini kemungkinan karena index belum dibuat
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  if (loading) return <p className="text-center text-orange-700">Memuat laporan...</p>;

  return (
    <div className="mb-8 p-4 bg-orange-100 border-l-4 border-orange-500 rounded-r-lg">
      <h2 className="text-xl font-bold text-orange-800 mb-4">Laporan Masuk</h2>
      {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map(report => 
            <ReportedPostCard key={report.id} report={report} onActionTaken={fetchReports} />
          )}
        </div>
      ) : (
        <p className="text-orange-700">Tidak ada laporan yang perlu ditinjau. Kerja bagus!</p>
      )}
    </div>
  );
};

export default AdminReportFeed;