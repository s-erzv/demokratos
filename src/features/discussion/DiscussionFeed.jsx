// src/components/features/discussion/DiscussionFeed.jsx

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from '../../firebase';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';

const DiscussionFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State untuk search
  const [filter, setFilter] = useState('terbaru');     // State untuk filter

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const postsCollection = collection(db, 'posts');
    let q;

    if (searchTerm.trim() !== '') {
      q = query(postsCollection, where('keywords', 'array-contains', searchTerm.toLowerCase()));
    } else {
      if (filter === 'populer') {
        q = query(postsCollection, orderBy('commentCount', 'desc'));
      } else {
        q = query(postsCollection, orderBy('createdAt', 'desc'));
      }
    }

    try {
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
  }, [searchTerm, filter]); // <-- Dependensi untuk useCallback

  // useEffect sekarang hanya bertugas memanggil fetchPosts
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); // <-- Akan fetch ulang jika search/filter berubah

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* BAGIAN HEADER SEKARANG PINDAH KE SINI */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h1 className="text-3xl font-bold">Diskusi Publik</h1>
          <p className="text-gray-600 mt-2">Aspirasi Anda penting...</p>
          <div className="mt-4 flex gap-4">
              <input 
                type="text" 
                placeholder="Telusuri topik diskusi..." 
                className="w-full p-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <div className="flex gap-2 mt-2">
                  <button onClick={() => setFilter('terbaru')} className={`px-4 py-1 rounded-full ${filter === 'terbaru' ? 'bg-red-800 text-white' : 'bg-gray-200'}`}>
                      Terbaru
                  </button>
                  <button onClick={() => setFilter('populer')} className={`px-4 py-1 rounded-full ${filter === 'populer' ? 'bg-red-800 text-white' : 'bg-gray-200'}`}>
                      Terpopuler
                  </button>
              </div>
          </div>
      </div>

      <div className='bg-white rounded-lg shadow-sm border mb-4'>
        
      {/* Daftar Post */}
      {loading ? (
        <p>Memuat diskusi...</p>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} onUpdate={fetchPosts} />)
      )}

      {/* Tombol & Modal */}
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="fixed bottom-8 right-8 bg-red-800 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg hover:bg-red-700"
      >
        +
      </button>
      
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onPostCreated={fetchPosts}
      />
      </div>
    </div>
  );
};

export default DiscussionFeed;