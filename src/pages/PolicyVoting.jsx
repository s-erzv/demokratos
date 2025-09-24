import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/AuthContext'; 
import { db } from '../firebase'; 
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; 
import { PlusCircle, Search, SlidersHorizontal, Loader2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card'; 
import { usePolicyActions } from '../features/policy-voting/hooks/usePolicyActions'; 

const HorizontalScrollContainer = ({ children }) => (
  <div className="overflow-x-auto whitespace-nowrap pb-4" style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
    {children}
    <style jsx="true">{`
      /* Hide scrollbar for Chrome, Safari and Opera */
      .overflow-x-auto::-webkit-scrollbar {
          display: none;
      }
      /* Hide scrollbar for IE and Edge */
      .overflow-x-auto {
          -ms-overflow-style: none;
      }
    `}</style>
  </div>
);

const PolicyVoting = () => {
  const { userData } = useAuth();
  const isAdmin = userData?.role === 'admin'; 
  
  const [policies, setPolicies] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [sortBy, setSortBy] = useState('newest'); 
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    
    if (searchTerm) {
      currentPolicies = currentPolicies.filter(policy => 
          policy.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          policy.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

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

    return {
      kebijakanPemerintah: currentPolicies.filter(p => p.type === 'kebijakan'),
      programPemerintah: currentPolicies.filter(p => p.type === 'program'),
      totalCount: currentPolicies.length,
    };
  }, [policies, searchTerm, sortBy]);
 
  const renderPolicySection = (title, policiesData) => { 
    if (policiesData.length === 0) {
        return (
            <section className="space-y-4">
                {/* Teks kecil di mobile */}
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                    {title}
                </h2>
                <p className="text-gray-500 text-sm">Belum ada kebijakan di bagian ini.</p>
            </section>
        );
    }

    return (
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          {/* Teks kecil di mobile */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {title}
          </h2>
          <Link to="/policies/all" className="flex items-center text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
            Lihat Semua ({policiesData.length})
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <HorizontalScrollContainer>
          {policiesData.map(policy => (
            <div key={policy.id} className="inline-block pr-4 last:pr-0 align-top w-[calc(100vw-4rem)] sm:w-[340px] md:w-[380px]">
              <Card 
                  {...policy}
                  isAdmin={isAdmin} 
                  onDelete={deletePolicy} 
              /> 
            </div>
          ))}
        </HorizontalScrollContainer>
      </section>
    );
  };
   
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

  return (
    <MainLayout>
      <div className="space-y-12">
        
        {errorDelete && (
             <div className="p-3 mb-4 text-center text-red-800 bg-red-100 rounded-lg">{errorDelete}</div>
        )}
         
        <header className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:px-10 md:py-14 relative border border-gray-100">
          <div className="absolute top-0 right-0 h-full w-[60%] z-0 hidden md:block">
            <div 
              className="w-full h-full bg-center bg-cover bg-no-repeat" 
              style={{ 
                backgroundImage: `url('/image policyvote.svg')`,
              }}
            >          
            </div>
          </div>

          <div className="relative z-10 max-w-2xl">
             
            {/* Judul Header: Kecil di mobile, besar di desktop */}
            <h1 className="text-xl mt-4 md:mt-0 sm:text-3xl md:text-4xl font-extrabold text-gray-800">
                Voting Kebijakan
            </h1>

            {/* Paragraf Header: Kecil di mobile, besar di desktop */}
            <p className="text-sm sm:text-lg text-gray-600 mt-2">
              Baca, pahami, lalu berikan suara Anda. Partisipasi Anda adalah wujud demokrasi.
            </p>
 
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Telusuri judul atau deskripsi..."
                  className="w-full border border-gray-300 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative w-full sm:w-auto">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full bg-primary text-white border border-white font-semibold py-2 px-6 rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors shadow-md text-sm" 
                  disabled={loadingDelete}
                >
                  <SlidersHorizontal size={20} className="mr-2" />
                  {currentSortLabel}
                </button>
                
                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-30">
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-xl" 
                      onClick={() => { setSortBy('newest'); setIsFilterOpen(false); }}
                    >
                      Terbaru
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                      onClick={() => { setSortBy('oldest'); setIsFilterOpen(false); }}
                    >
                      Terlama
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-xl" 
                      onClick={() => { setSortBy('most-voted'); setIsFilterOpen(false); }}
                    >
                      Terpopuler
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </header>
        
        {renderPolicySection('Kebijakan Pemerintah', sortedAndFilteredPolicies.kebijakanPemerintah)}
        {renderPolicySection('Program Pemerintah', sortedAndFilteredPolicies.programPemerintah)}
         
        {(sortedAndFilteredPolicies.kebijakanPemerintah.length === 0 && sortedAndFilteredPolicies.programPemerintah.length === 0 && searchTerm) && (
            <p className="text-center text-sm sm:text-xl text-gray-500 mt-10">Tidak ditemukan kebijakan yang cocok dengan "{searchTerm}".</p>
        )}
 
        <div className="h-6"></div> 

         {isAdmin && (
            <div className="fixed bottom-8 right-8 z-30">
                <Link 
                    to="/create-policy" 

                    className="flex items-center p-4 bg-primary text-white rounded-full shadow-lg hover:bg-red-700 transition-colors transform hover:scale-110"
                    aria-label="Buat Vote Baru"
                >
                    <PlusCircle size={28} />
                </Link>
            </div>
        )}

      </div>
    </MainLayout>
  );
};

export default PolicyVoting;