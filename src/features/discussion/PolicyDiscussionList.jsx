import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from '../../firebase';
import PostCard from './PostCard';

const PolicyDiscussionList = ({ policyId }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDiscussions = async () => {
      if (!policyId) return; // Jangan fetch jika tidak ada ID kebijakan

      setLoading(true);
      try {
        const postsCollection = collection(db, 'posts');
        
        // --- INI ADALAH QUERY KUNCINYA ---
        // Ambil semua post DI MANA 'sourceId' sama dengan 'policyId'
        // dan urutkan berdasarkan yang terbaru.
        const q = query(
          postsCollection, 
          where("sourceId", "==", policyId),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const discussionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setDiscussions(discussionsData);
      } catch (err) {
        console.error("Error fetching policy discussions:", err);
        setError("Gagal memuat diskusi.");
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [policyId]); // Jalankan ulang jika policyId berubah

  if (loading) {
    return <p className="text-center mt-8">Memuat diskusi...</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-500">{error}</p>;
  }

  return (
    <div className="mt-2">
      {discussions.length > 0 ? (
        <div className="space-y-1">
          {discussions.map(post => (
            // Kita bisa gunakan ulang komponen PostCard yang sudah ada!
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="font-semibold text-slate-700">Belum Ada Diskusi</p>
          <p className="text-sm text-slate-500 mt-1">Jadilah yang pertama memulai percakapan tentang kebijakan ini.</p>
        </div>
      )}
    </div>
  );
};

export default PolicyDiscussionList;