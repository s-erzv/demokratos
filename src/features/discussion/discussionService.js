// src/components/features/discussion/discussionService.js

import { doc, runTransaction, collection, getDoc, increment } from "firebase/firestore";
import { db } from "../../firebase"

/**
 * Mengelola logika like/unlike untuk sebuah post.
 * @param {string} postId - ID dari post yang di-like.
 * @param {string} userId - UID dari pengguna yang melakukan aksi.
 */
export const toggleLikePost = async (postId, userId) => {
  if (!postId || !userId) return;

  const postRef = doc(db, 'posts', postId);
  const likeRef = doc(db, 'posts', postId, 'likes', userId);

  try {
    await runTransaction(db, async (transaction) => {
      const likeDoc = await transaction.get(likeRef);

      if (likeDoc.exists()) {
        // Jika sudah ada (unlike)
        transaction.delete(likeRef);
        transaction.update(postRef, { likeCount: increment(-1) }); // Gunakan increment(-1) jika bisa
      } else {
        // Jika belum ada (like)
        transaction.set(likeRef, { likedAt: new Date() });
        transaction.update(postRef, { likeCount: increment(1) }); // Gunakan increment(1) jika bisa
      }
    });
    console.log("Like/Unlike transaction successful");
    return true;
  } catch (error) {
    console.error("Like/Unlike transaction failed: ", error);
    return false;
  }
};

export const reportPost = async (postId, userId, reason) => {
    if (!postId || !userId) return false;
  
    const reportRef = doc(db, 'posts', postId, 'reports', userId);
    const reportDoc = await getDoc(reportRef);
  
    if (reportDoc.exists()) {
      // Pengguna sudah pernah melaporkan post ini
      alert("Anda sudah pernah melaporkan diskusi ini.");
      return false;
    }
  
    try {
      await setDoc(reportRef, {
        reportedAt: new Date(),
        // Di aplikasi nyata, kamu akan membuka modal untuk menanyakan alasan
        reason: reason
      });
      
      console.log("Post reported successfully.");
      return true;
    } catch (error) {
      console.error("Failed to report post: ", error);
      return false;
    }
};