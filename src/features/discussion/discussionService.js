// src/components/features/discussion/discussionService.js

import { doc, runTransaction, collection, getDoc, setDoc, increment, deleteDoc, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


/**
 * Mengelola logika like/unlike untuk sebuah post.
 * @param {string} postId - ID dari post yang di-like.
 * @param {string} commentId - ID dari komentar yang di-like.
 * @param {string} replyId - ID dari balasan yang di-like.
 * @param {string} userId - UID dari pengguna yang melakukan aksi.
 * @param {File} file - File yang akan diunggah.
 * @returns {Promise<string>} - URL download dari file yang diunggah.
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
  if (!post || !currentUserData || !reason) return false;

  const { uid: reporterId, fullName: reporterName } = currentUserData;
  const { id: postId, authorId: reportedPostAuthorId, authorName, authorPhotoURL, isAnonymous, question, body } = post;
  
  const reportCheckRef = doc(db, 'posts', postId, 'reports', reporterId);
  const newReportRef = doc(collection(db, 'reports'));

  try {
    await runTransaction(db, async (transaction) => {
      const reportCheckDoc = await transaction.get(reportCheckRef);
      if (reportCheckDoc.exists()) {
        throw new Error("User has already reported this post.");
      }

      // 1. Tandai bahwa user ini sudah melapor
      // 'serverTimestamp' sekarang sudah dikenali
      transaction.set(reportCheckRef, { reportedAt: serverTimestamp(), reason });

      // 2. Buat dokumen laporan baru untuk admin
      transaction.set(newReportRef, {
        postId, postQuestion: question, postBody: body,
        reportedPostAuthorId, reportedPostAuthorName: authorName, reportedPostAuthorPhotoURL: authorPhotoURL || null,
        isPostAnonymous: isAnonymous || false,
        reporterId, reporterName,
        reason, status: "pending",
        createdAt: serverTimestamp(), // 'serverTimestamp' sekarang sudah dikenali
      });
    });
    
    return true;
  } catch (error) {
    console.error("Failed to report post:", error); // <-- Ini yang memunculkan error di console
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

export const uploadDiscussionFile = async (file, userId) => {
  if (!file || !userId) return null;

  // Dapatkan referensi ke Firebase Storage
  const storage = getStorage();
  
  // Buat path yang unik untuk setiap file untuk menghindari tumpukan nama
  // Contoh: discussions/user_id_123/1677889900_namafile.jpg
  const filePath = `discussions/${userId}/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, filePath);

  try {
    // Unggah file
    const snapshot = await uploadBytes(fileRef, file);
    
    // Dapatkan URL download setelah berhasil diunggah
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log("File berhasil diunggah:", downloadURL);
    return downloadURL;

  } catch (error) {
    console.error("Error mengunggah file:", error);
    return null; // Kembalikan null jika gagal
  }
};