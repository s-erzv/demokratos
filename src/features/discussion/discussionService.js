// src/components/features/discussion/discussionService.js

import { doc, runTransaction, collection, getDoc } from "firebase/firestore";
import { db } from '../../../firebase'; // Sesuaikan path

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
        transaction.update(postRef, { likeCount: -1 }); // Gunakan increment(-1) jika bisa
      } else {
        // Jika belum ada (like)
        transaction.set(likeRef, { likedAt: new Date() });
        transaction.update(postRef, { likeCount: 1 }); // Gunakan increment(1) jika bisa
      }
    });
    console.log("Like/Unlike transaction successful");
    return true;
  } catch (error) {
    console.error("Like/Unlike transaction failed: ", error);
    return false;
  }
};

export const reportPost = async (postId, userId) => {
    if (!postId || !userId) return;
  
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
        reason: "N/A"
      });
      
      // Opsional: Kamu bisa menambahkan field 'reportCount' di post
      // dan meng-increment-nya di sini jika perlu.
      
      alert("Terima kasih atas laporan Anda. Tim kami akan meninjaunya.");
      return true;
    } catch (error) {
      console.error("Failed to report post: ", error);
      alert("Gagal mengirim laporan.");
      return false;
    }
};