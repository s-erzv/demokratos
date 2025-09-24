import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from '../../firebase';
import PostCard from './PostCard';

const PolicyDiscussionList = ({ sourceId, searchTerm = '', refreshKey }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allDiscussions, setAllDiscussions] = useState([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState([]);
  

  const fetchDiscussions = useCallback(async () => {
    if (!sourceId) { setLoading(false); return; }
    setLoading(true);
    try {
      const postsCollection = collection(db, 'posts');
      const q = query(
        postsCollection, 
        where("sourceId", "==", sourceId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const discussionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllDiscussions(discussionsData);
      setFilteredDiscussions(discussionsData);
    } catch (err) {
      console.error("Error fetching discussions:", err);
      setError("Gagal memuat diskusi.");
    } finally {
      setLoading(false);
    }
  }, [sourceId, refreshKey]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDiscussions(allDiscussions);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = allDiscussions.filter(discussion => 
        discussion.question.toLowerCase().includes(lowercasedTerm) ||
        (discussion.body && discussion.body.toLowerCase().includes(lowercasedTerm))
      );
      setFilteredDiscussions(filtered);
    }
  }, [searchTerm, allDiscussions]);

  if (loading) {
    return <p className="text-center mt-8">Memuat diskusi...</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-500">{error}</p>;
  }

  return (
    <div className="mt-2">
      {filteredDiscussions.length > 0 ? (
        <div className="">
          {filteredDiscussions.map((post, index) => (
            <div key={post.id}>
              <PostCard post={post} onUpdate={fetchDiscussions} />
              {index < filteredDiscussions.length - 1 }
            </div>
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