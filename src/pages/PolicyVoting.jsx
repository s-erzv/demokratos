import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/AuthContext'; 
import { db } from '../firebase'; 
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; 
import { PlusCircle, Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card'; 

const PolicyVoting = () => {
  const { userData } = useAuth();
  const isAdmin = userData?.role === 'admin'; 
  
  const [policies, setPolicies] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState(''); 
 
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
          votes: (data.votesYes + data.votesNo).toLocaleString('id-ID'), 
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
 
  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);
 
  const kebijakanPemerintah = policies.filter(p => p.type === 'kebijakan');
  const programPemerintah = policies.filter(p => p.type === 'program');
 
  const renderPolicySection = (title, policiesData) => { 
    const filteredPolicies = policiesData.filter(policy => 
        policy.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        policy.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
 
    if (filteredPolicies.length === 0 && searchTerm) {
      return null;
    }
     
    if (filteredPolicies.length === 0 && !loading) {
        return (
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">{title}</h2>
                <p className="text-gray-500">Belum ada kebijakan di bagian ini.</p>
            </section>
        );
    }
    

    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPolicies.map(policy => (
            <Card key={policy.id} {...policy} /> 
          ))}
        </div>
      </section>
    );
  };
   
  if (loading) {
      return (
          <MainLayout>
              <div className="flex justify-center items-center h-[50vh]">
                  <Loader2 size={32} className="animate-spin text-primary" />
                  <p className="ml-3 text-lg text-gray-600">Memuat kebijakan...</p>
              </div>
          </MainLayout>
      );
  }

  return (
    <MainLayout>
      <div className="space-y-12">
         
        <header className="bg-white rounded-xl shadow-lg p-6 md:px-10 md:py-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-[60%] z-0">
            <div 
              className="w-full h-full bg-center bg-cover bg-no-repeat" 
              style={{ 
                backgroundImage: `url('/image policyvote.svg')`,
                backgroundColor: '#FFF5F5', 
                backgroundRepeat: 'repeat',
              }}
            >          
            </div>
          </div>

          <div className="relative z-10">
             
            <div className='flex justify-between items-center'>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                    Voting Kebijakan
                </h1>
            </div>

            <p className="text-lg text-gray-600 mt-2">
              Baca, pahami, lalu berikan suara Anda.
            </p>
 
            <div className="mt-6 flex flex-col md:flex-row gap-4 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Telusuri daftar kebijakan..."
                  className="w-full border border-gray-300 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition duration-150"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="bg-primary text-white border border-white font-semibold py-2 px-6 rounded-xl flex items-center justify-center hover:bg-red-800 transition-colors">
                <SlidersHorizontal size={20} className="mr-2" />
                Filter
              </button>
            </div>
          </div>
        </header>
 
        {renderPolicySection('Kebijakan Pemerintah', kebijakanPemerintah)}
        {renderPolicySection('Program Pemerintah', programPemerintah)}
         
        {kebijakanPemerintah.length === 0 && programPemerintah.length === 0 && searchTerm && !loading && (
            <p className="text-center text-xl text-gray-500 mt-10">Tidak ditemukan kebijakan yang cocok dengan "{searchTerm}".</p>
        )}
 
         {isAdmin && (
            <div className="fixed bottom-8 right-8 z-30">
                <Link 
                    to="/create-policy" 
                    className="flex items-center p-4 bg-primary text-white rounded-full shadow-lg hover:bg-red-800 transition-colors transform hover:scale-110"
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