// src/components/features/discussion/discussionService.js

import { doc, runTransaction, collection, getDoc, setDoc, increment, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../../firebase"

/**
 * Mengelola logika like/unlike untuk sebuah post.
 * @param {string} postId - ID dari post yang di-like.
 * @param {string} commentId - ID dari komentar yang di-like.
 * @param {string} replyId - ID dari balasan yang di-like.
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

export const reportPost = async (post, currentUserData, reason) => {
  const { uid: reporterId, fullName: reporterName } = currentUserData;
  const { id: postId, authorId: reportedPostAuthorId } = post;

  if (!postId || !reporterId || !reason) return false;

  const reportRef = doc(db, 'posts', postId, 'reports', reporterId);
  const reportDoc = await getDoc(reportRef);

  if (reportDoc.exists()) {
    console.log("User has already reported this post.");
    return false;
  }

  try {
    // 1. Tetap tandai di sub-koleksi untuk mencegah lapor dua kali
    await setDoc(reportRef, { reportedAt: serverTimestamp(), reason });
    
    // 2. BUAT DOKUMEN BARU DI KOLEKSI /reports UNTUK ADMIN
    const newReportRef = doc(collection(db, 'reports'));
    await setDoc(newReportRef, {
      postId,
      postQuestion: post.question,
      postBody: post.body,
      reportedPostAuthorId,
      reportedPostAuthorName: post.authorName, // Nama asli (atau "Anonim")
      isPostAnonymous: post.isAnonymous,
      reporterId,
      reporterName,
      reason,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Failed to report post: ", error);
    return false;
  }
};

export const toggleCommentLike = async (postId, commentId, userId) => {
  if (!postId || !commentId || !userId) return false;

  // Path sekarang menunjuk ke dokumen komentar, bukan post
  const commentRef = doc(db, 'posts', postId, 'comments', commentId);
  const likeRef = doc(db, 'posts', postId, 'comments', commentId, 'likes', userId);

  try {
    await runTransaction(db, async (transaction) => {
      const likeDoc = await transaction.get(likeRef);

      if (likeDoc.exists()) {
        // Jika sudah me-like -> UNLIKE
        transaction.delete(likeRef);
        transaction.update(commentRef, { likeCount: increment(-1) });
      } else {
        // Jika belum me-like -> LIKE
        transaction.set(likeRef, { likedAt: new Date() });
        transaction.update(commentRef, { likeCount: increment(1) });
      }
    });
    console.log("Transaksi like/unlike komentar berhasil");
    return true;
  } catch (error) {
    console.error("Transaksi like/unlike komentar gagal: ", error);
    console.error("--- TRANSAKSI LIKE GAGAL ---");
    console.error("Pesan Error:", error.message); // Pesan yang bisa dibaca manusia
    console.error("Kode Error:", error.code);     // Kode error dari Firebase
    console.error("Objek Error Lengkap:", error);
    return false;
  }
};

export const toggleReplyLike = async (postId, parentCommentId, replyId, userId) => {
  if (!postId || !parentCommentId || !replyId || !userId) return false;

  // Path sekarang menunjuk ke dokumen balasan di dalam sub-koleksi 'replies'
  const replyRef = doc(db, 'posts', postId, 'comments', parentCommentId, 'replies', replyId);
  const likeRef = doc(db, 'posts', postId, 'comments', parentCommentId, 'replies', replyId, 'likes', userId);

  try {
    await runTransaction(db, async (transaction) => {
      const likeDoc = await transaction.get(likeRef);
      if (likeDoc.exists()) {
        transaction.delete(likeRef);
        transaction.update(replyRef, { likeCount: increment(-1) });
      } else {
        transaction.set(likeRef, { likedAt: new Date() });
        transaction.update(replyRef, { likeCount: increment(1) });
      }
    });
    return true;
  } catch (error) {
    console.error("Transaksi like/unlike balasan gagal: ", error);
    return false;
  }
};