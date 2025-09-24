import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from '../../firebase';
import PostCard from './PostCard';
import { useAuth } from '../../hooks/AuthContext';
import AdminReportFeed from './AdminReportFeed';
import ikonDiskusi from '../../assets/ikondiskusi.svg';
import { SlidersHorizontal } from 'lucide-react';


const DiscussionFeed = () => {
  const { isAdmin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filter, setFilter] = useState(null);     
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey(prevKey => prevKey + 1);

  const filterDisplayNames = {
    policy: 'Kebijakan',
    laporan: 'Laporan Warga',
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    
    try {
      let q = collection(db, 'posts');

      if (filter) {
        q = query(q, where("sourceType", "==", filter));
      }

      if (searchTerm.trim() !== '') {
        q = query(q, where('keywords', 'array-contains', searchTerm.toLowerCase()));
      }

      q = query(q, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
        
      setPosts(postsData);
    
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filter]); 

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, refreshKey]); 

  const handleFilterSelect = (type) => {
    setFilter(prevFilter => prevFilter === type ? null : type);
    setIsFilterOpen(false); 
  };

  return (
    
    // Container utama tidak lagi dibatasi 'max-w-4xl', biarkan MainLayout yang mengatur
  <div className="space-y-8">
    
    {/* Header Baru: Mengadopsi style dari contoh Anda */}
    <header className="bg-white rounded-3xl shadow-lg  flex justify-between items-center">
  
    {/* Konten Teks & Kontrol di sebelah kiri */}
    <div className="p-6 md:px-10 md:py-12">
      <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-800">
        Ruang Diskusi Publik
      </h1>
      <p className="text-sm lg:text-lg text-slate-600 mt-2">
        Temukan semua aspirasi dan diskusi terkait kebijakan dan laporan warga.
      </p>

      {/* Search & Filter */}
      <div className="mt-8 flex flex-col md:flex-row gap-3 max-w-lg">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          {/* ... (kode search bar Anda tetap sama) ... */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Telusuri topik diskusi..."
            className="w-full border border-gray-300 rounded-full py-1.5 md:py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition duration-150"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filter Dropdown (Tombol & Menu) */}
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(prev => !prev)}
            className="w-full md:w-auto bg-primary text-white font-semibold py-1.5 md:py-2.5 px-6 rounded-xl flex items-center justify-center hover:bg-red-800 transition-colors"
          >
             <SlidersHorizontal size={20} className="mr-2" />
             <span>{filter ? filterDisplayNames[filter] : 'Filter'}</span>
          </button>

          {/* Menu Dropdown yang Diperbarui */}
          <div 
            className={`
              absolute top-full right-0 mt-2 w-full md:w-40  rounded-xl   p-2
              transition-all duration-150 ease-out space-y-2
              ${isFilterOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
              z-50
            `}
          >
            {Object.entries(filterDisplayNames).map(([key, value]) => (
              <button 
                key={key}
                onClick={() => handleFilterSelect(key)}
                className={`w-full px-3 py-2 rounded-lg text-sm flex items-center justify-between bg-red-800 text-white font-semibold ${filter === key ? 'bg-primary text-white' : ''}`}
              >
                <span>{value}</span>
                {/* Tambahkan ikon centang jika filter aktif */}
                {filter === key && (
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    
    {/* Area Gambar SVG di sebelah kanan (sekarang menjadi flex item) */}
    <div className="w-1/4 h-full flex-shrink-0 hidden md:block">
      <img 
        src={ikonDiskusi}
        alt='ikon diskusi'
        className='w-full h-full object-cover'
      />
    </div>
  </header>

  {isAdmin && <AdminReportFeed onPostAction={triggerRefresh} />}
        
    {/* Daftar Post: Dengan loading & empty state yang lebih baik */}
    {loading ? (
      <div className="text-center py-12">
        <p className="text-slate-500">Memuat diskusi...</p>
      </div>
    ) : posts.length > 0 ? (

      // Inilah kontainer utamanya: satu kartu putih dengan shadow dan sudut membulat.
      <div className="bg-white sm:px-4 md:px-10 rounded-3xl shadow-lg border border-slate-200/80">
        {posts.map((post) => (
          // Setiap post dibungkus div dengan garis bawah (border-b).
          // 'last:border-b-0' adalah trik untuk menghilangkan garis pada item terakhir.
          <div key={post.id} className="">
            <PostCard post={post} onUpdate={fetchPosts} />
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center bg-white rounded-3xl py-16">
        <p className="text-slate-500">Tidak ada diskusi untuk ditampilkan.</p>
      </div>
    )}
  </div>
  );
};

export default DiscussionFeed;