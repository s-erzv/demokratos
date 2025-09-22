import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import LaporCard from './laporCard';
import { useLapor } from '../hooks/useLapor';
import { useAuth } from '../../../hooks/AuthContext';
import { db } from '../../../firebase';

export default function ContentLengkap({ kategori }) {
    // State dari context untuk search dan filter
    const { search, filter } = useLapor();
    const { userData } = useAuth();

    // State Internal Komponen
    const [sourceData, setSourceData] = useState([]);      // Menyimpan data asli dari Firestore
    const [displayData, setDisplayData] = useState([]);    // Data setelah di-filter & search
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20; // Tampilkan 9 item per halaman

    // 1. useEffect untuk mengambil data dari Firestore
    useEffect(() => {
        const fetchLaporan = async () => {
            setLoading(true);
            try {
                const laporanRef = collection(db, "laporan");
                let q = query(laporanRef);

                if (kategori === 'Terpopuler') {
                    q = query(q, orderBy("pendukung", "desc"));
                } else if (kategori === 'Terbaru') {
                    q = query(q, orderBy("createdAt", "desc"));
                } else if (kategori === 'Laporan Anda' && userData) {
                    q = query(q, where("authorId", "==", userData.uid));
                }
                // Anda bisa menambahkan else untuk kategori lain di sini jika perlu
                
                const querySnapshot = await getDocs(q);
                const laporanData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                
                setSourceData(laporanData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchLaporan();
    }, [kategori, userData]);

    // 2. useEffect untuk menerapkan filter dan search di sisi klien
    useEffect(() => {
        let result = sourceData;

        // Terapkan filter kategori dari context
        if (filter) {
            result = result.filter(laporan => laporan.kategori === filter);
        }

        // Terapkan search dari context
        if (search) {
            result = result.filter(laporan => 
                laporan.judul.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        setDisplayData(result);
        setCurrentPage(1); // Reset ke halaman 1 setiap kali filter berubah
    }, [search, filter, sourceData]);

    // 3. Logika untuk paginasi client-side
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentItems = displayData.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(displayData.length / itemsPerPage);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="w-full">
            <div className="flex flex-row items-center justify-between">
                <h1 className="p-5 text-3xl font-bold border-b-2">{kategori}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-5 p-2 mb-5">
                {currentItems.map(laporan => (
                    <div key={laporan.id}>
                        <LaporCard imageURL={laporan.fileURL} judul={laporan.judul} deskripsi={laporan.deskripsi} alamat={laporan.alamat} kategori={laporan.kategori} status={laporan.status} pendukung={laporan.pendukung} id={laporan.docId}/>
                    </div>
                ))}
            </div>

            {/* Navigasi Paginasi */}
            {displayData.length > itemsPerPage && (
                <div className="flex justify-center items-center gap-4 mt-5">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1}
                        className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
                    >
                        Sebelumnya
                    </button>
                    <span>Halaman {currentPage} dari {totalPages}</span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages}
                        className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        Berikutnya
                    </button>
                </div>
            )}
        </div>
    );
}