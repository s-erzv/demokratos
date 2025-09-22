import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/AuthContext'; 
import { db } from '../firebase'; 
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; 
import { Search, SlidersHorizontal, Loader2, ChevronLeft } from 'lucide-react';
import Card from '../components/Card'; 
import { usePolicyActions } from '../hooks/usePolicyActions'; 
import { Link } from 'react-router-dom'; // Pastikan Link di-import

const AllPoliciesPage = () => {
  const { userData } = useAuth();
  const isAdmin = userData?.role === 'admin'; 
  
  const [policies, setPolicies] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [sortBy, setSortBy] = useState('newest'); 
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState('all'); 

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      const policiesCollection = collection(db, 'policies');
      const q = query(policiesCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedPolicies = querySnapshot.docs.map(doc => {
        const data = doc.data();
         
        const dateObject = data.dueDate ? data.dueDate.toDate() : new Date();
        const formattedDate = dateObject.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        return {
          id: doc.id,
          ...data, 
          category: data.type === 'kebijakan' ? 'Kebijakan' : 'Program', 
          date: formattedDate, 
          votes: (data.votesYes + data.votesNo) || 0, 
          votesDisplay: (data.votesYes + data.votesNo).toLocaleString('id-ID'), 
          createdAtTimestamp: data.createdAt ? data.createdAt.toMillis() : 0,
          votesYes: data.votesYes || 0,
          votesNo: data.votesNo || 0,
          imageUrl: data.thumbnailUrl, 
        };
      });
      
      setPolicies(fetchedPolicies);
    } catch (error) {
      console.error("Error fetching policies:", error); 
    } finally {
      setLoading(false);
    }
  }, []); 

  const { deletePolicy, loadingDelete, errorDelete } = usePolicyActions(fetchPolicies);
 
  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);
  
  const sortedAndFilteredPolicies = useMemo(() => {
    let currentPolicies = [...policies];
    
    // 1. Filter by Type
    if (filterType !== 'all') {
        currentPolicies = currentPolicies.filter(p => p.type === filterType);
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      currentPolicies = currentPolicies.filter(policy => 
          policy.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          policy.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 3. Sorting
    currentPolicies.sort((a, b) => {
      if (sortBy === 'newest') {
        return b.createdAtTimestamp - a.createdAtTimestamp;
      } else if (sortBy === 'oldest') {
        return a.createdAtTimestamp - b.createdAtTimestamp;
      } else if (sortBy === 'most-voted') {
        return b.votes - a.votes;
      }
      return 0;
    });

    return currentPolicies;
  }, [policies, searchTerm, sortBy, filterType]);
 
   
  if (loading || loadingDelete) {
      return (
          <MainLayout>
              <div className="flex justify-center items-center h-[50vh]">
                  <Loader2 size={32} className="animate-spin text-primary" />
                  <p className="ml-3 text-lg text-gray-600">{loadingDelete ? 'Menghapus kebijakan...' : 'Memuat kebijakan...'}</p>
              </div>
          </MainLayout>
      );
  }

  const currentSortLabel = {
    'newest': 'Terbaru',
    'oldest': 'Terlama',
    'most-voted': 'Terpopuler',
  }[sortBy];
  
  const currentFilterTypeLabel = {
      'all': 'Semua Jenis',
      'kebijakan': 'Kebijakan',
      'program': 'Program',
  }[filterType];

  return (
    <MainLayout>
      <div className="space-y-8">
        
        {errorDelete && (
             <div className="p-3 mb-4 text-center text-red-800 bg-red-100 rounded-lg">{errorDelete}</div>
        )}
         
        <header className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            
            {/* Tombol Kembali ke Voting */}
            <div className="mb-4">
                <Link 
                    to="/vote" 
                    className="flex items-center text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
                >
                    <ChevronLeft size={20} className="mr-1" />
                    Kembali ke Voting Utama
                </Link>
            </div>
             
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 border-b border-gray-200 pb-3 mb-4">
                Daftar Lengkap Voting
            </h1>

            <div className="flex flex-col md:flex-row gap-4">
              
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan judul atau deskripsi..."
                  className="w-full border border-gray-300 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filter Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full md:w-auto bg-primary text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors shadow-md text-sm" 
                  disabled={loadingDelete}
                >
                  <SlidersHorizontal size={20} className="mr-2" />
                  {currentSortLabel} ({currentFilterTypeLabel})
                </button>
                
                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-30 overflow-hidden">
                    
                    {/* Urutkan Berdasarkan */}
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b">Urutkan Berdasarkan</div>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === 'newest' ? 'bg-red-100 text-primary font-bold' : 'text-gray-700 hover:bg-gray-100'}`} 
                      onClick={() => { setSortBy('newest'); setIsFilterOpen(false); }}
                    >
                      Terbaru
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === 'oldest' ? 'bg-red-100 text-primary font-bold' : 'text-gray-700 hover:bg-gray-100'}`} 
                      onClick={() => { setSortBy('oldest'); setIsFilterOpen(false); }}
                    >
                      Terlama
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === 'most-voted' ? 'bg-red-100 text-primary font-bold' : 'text-gray-700 hover:bg-gray-100'} border-b`} 
                      onClick={() => { setSortBy('most-voted'); setIsFilterOpen(false); }}
                    >
                      Terpopuler
                    </button>
                    
                    {/* Tipe Konten */}
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b">Tipe Konten</div>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${filterType === 'all' ? 'bg-red-100 text-primary font-bold' : 'text-gray-700 hover:bg-gray-100'}`} 
                      onClick={() => { setFilterType('all'); setIsFilterOpen(false); }}
                    >
                      Semua Jenis
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${filterType === 'kebijakan' ? 'bg-red-100 text-primary font-bold' : 'text-gray-700 hover:bg-gray-100'}`} 
                      onClick={() => { setFilterType('kebijakan'); setIsFilterOpen(false); }}
                    >
                      Hanya Kebijakan
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${filterType === 'program' ? 'bg-red-100 text-primary font-bold' : 'text-gray-700 hover:bg-gray-100'}`} 
                      onClick={() => { setFilterType('program'); setIsFilterOpen(false); }}
                    >
                      Hanya Program
                    </button>
                  </div>
                )}
              </div>

            </div>
        </header>
        
        {/* Policy Grid */}
        <section className="space-y-6">
            {sortedAndFilteredPolicies.length === 0 && (
                <p className="text-center text-xl text-gray-500 mt-10">Tidak ditemukan kebijakan yang cocok dengan kriteria Anda.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedAndFilteredPolicies.map(policy => (
                    <Card 
                        key={policy.id} 
                        {...policy}
                        isAdmin={isAdmin} 
                        onDelete={deletePolicy} 
                    /> 
                ))}
            </div>
        </section>

      </div>
    </MainLayout>
  );
};

export default AllPoliciesPage;