const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp(); 

const db = admin.firestore();

async function deleteCollection(collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);
  
    return new Promise((resolve, reject) => {
      deleteQueryBatch(query, resolve).catch(reject);
    });
}
  
async function deleteQueryBatch(query, resolve) {
    const snapshot = await query.get();
  
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // Jika tidak ada lagi dokumen, selesai.
      resolve();
      return;
    }
  
    // Hapus dokumen dalam satu batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  
    // Rekursif
    process.nextTick(() => {
      deleteQueryBatch(query, resolve);
    });
}

exports.submitPolicy = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        const authorization = req.headers.authorization;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({ status: 'error', message: 'Anda harus login untuk mengakses fitur ini.' });
        }

        const idToken = authorization.split('Bearer ')[1];
        let userId;

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            userId = decodedToken.uid;
        } catch (error) {
            return res.status(401).json({ status: 'error', message: 'Token tidak valid atau kedaluwarsa. Silakan login ulang.' });
        }

        try {
            const userDoc = await db.collection('users').doc(userId).get();
            
            if (!userDoc.exists || userDoc.data().role !== 'admin') {
                return res.status(403).json({ status: 'error', message: 'Hanya Admin yang dapat membuat kebijakan.' });
            }

        } catch (error) {
            return res.status(500).json({ status: 'error', message: 'Gagal memverifikasi peran pengguna.' });
        }
        
        const { title, description, category, deadline, thumbnailUrl, documentUrl } = req.body;
        
        if (!title || !description || !category || !deadline || !thumbnailUrl) {
            return res.status(400).json({ status: 'error', message: 'Data kebijakan wajib diisi.' });
        }
        
        const validCategories = ['kebijakan', 'program'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ status: 'error', message: 'Kategori harus "kebijakan" atau "program".' });
        }

        const newPolicyData = {
            title,
            description,
            type: category,
            thumbnailUrl,
            documentUrl: documentUrl || null,
            votesYes: 0,
            votesNo: 0,
            status: 'Active', 
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            dueDate: admin.firestore.Timestamp.fromDate(new Date(deadline)), 
            authorId: userId,
        };

        try {
            const docRef = await db.collection('policies').add(newPolicyData);
            
            return res.status(200).json({ 
                status: 'success', 
                message: 'Kebijakan berhasil dibuat dan dipublikasikan.',
                policyId: docRef.id
            });
            
        } catch (error) {
            return res.status(500).json({ status: 'error', message: 'Gagal menyimpan kebijakan ke database.' });
        }
    });
});

exports.deletePolicy = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        const authorization = req.headers.authorization;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({ status: 'error', message: 'Anda harus login untuk mengakses fitur ini.' });
        }

        const idToken = authorization.split('Bearer ')[1];
        let userId;

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            userId = decodedToken.uid;
        } catch (error) {
            return res.status(401).json({ status: 'error', message: 'Token tidak valid atau kedaluwarsa.' });
        }
        
        const policyId = req.body.policyId;

        if (!policyId) {
            return res.status(400).json({ status: 'error', message: 'ID kebijakan tidak ditemukan.' });
        }

        try {
            const userDoc = await db.collection('users').doc(userId).get();
            
            if (!userDoc.exists || userDoc.data().role !== 'admin') {
                return res.status(403).json({ status: 'error', message: 'Hanya Admin yang dapat menghapus kebijakan.' });
            }

            await db.collection('policies').doc(policyId).delete();
            
            return res.status(200).json({ 
                status: 'success', 
                message: 'Kebijakan berhasil dihapus.',
            });
            
        } catch (error) {
            console.error("Error deleting policy:", error);
            return res.status(500).json({ status: 'error', message: `Gagal menghapus kebijakan. ${error.message}` });
        }
    });
});
 
exports.votePolicy = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        const authorization = req.headers.authorization;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({ status: 'error', message: 'Anda harus login untuk memberikan suara.' });
        }

        const idToken = authorization.split('Bearer ')[1];
        let userId;

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            userId = decodedToken.uid;
        } catch (error) {
            return res.status(401).json({ status: 'error', message: 'Token tidak valid atau kedaluwarsa.' });
        }
        
        const { policyId, vote, reason } = req.body;

        if (!policyId || (vote !== 'yes' && vote !== 'no')) {
            return res.status(400).json({ status: 'error', message: 'Pilihan vote tidak valid.' });
        }
        
        // 1. Cek apakah user sudah voting untuk kebijakan ini (KUNCI PENCEGAHAN DOUBLE VOTE)
        // Gunakan format dokumen: {userId}_{policyId}
        const userVoteDocRef = db.collection('votes').doc(`${userId}_${policyId}`);

        try {
            const userVoteSnap = await userVoteDocRef.get();

            if (userVoteSnap.exists) {
                // Mencegah double vote
                return res.status(403).json({ status: 'error', message: 'Anda sudah pernah memberikan suara untuk kebijakan ini. Suara Anda adalah final.' });
            }
            
            // 2. Tentukan field yang akan di-update
            const voteField = vote === 'yes' ? 'votesYes' : 'votesNo';

            // 3. Lakukan transaksi: Update counter di policies dan catat vote user
            await db.runTransaction(async (transaction) => {
                
                const policyRef = db.collection('policies').doc(policyId);
                
                // a. Update counter vote
                transaction.update(policyRef, {
                    [voteField]: admin.firestore.FieldValue.increment(1)
                });

                // b. Catat vote user
                transaction.set(userVoteDocRef, {
                    policyId: policyId,
                    userId: userId,
                    choice: vote,
                    reason: reason || null,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            });
            
            return res.status(200).json({ 
                status: 'success', 
                message: `Suara ${vote === 'yes' ? 'Setuju' : 'Tidak Setuju'} Anda berhasil dicatat.`,
            });
            
        } catch (error) {
            console.error("Error processing vote transaction:", error);
            if (error.code === 'not-found') {
                return res.status(404).json({ status: 'error', message: 'Kebijakan yang Anda vote tidak ditemukan.' });
            }
            return res.status(500).json({ status: 'error', message: `Gagal mencatat suara. ${error.message}` });
        }
    });
});

exports.deletePost = functions.https.onCall(async (data, context) => {
    // LOG: Awal eksekusi fungsi
    functions.logger.info(`Fungsi deletePost dipanggil oleh UID: ${context.auth.uid}`, { structuredData: true });
  
    // 1. Keamanan: Pastikan pemanggil adalah admin
    if (context.auth.token.admin !== true) {
      functions.logger.warn(`Pengguna non-admin (UID: ${context.auth.uid}) mencoba menghapus post.`);
      throw new functions.https.HttpsError("permission-denied", "Hanya admin yang bisa menghapus post.");
    }
  
    const postId = data.postId;
    if (!postId) {
      functions.logger.error("Error: postId tidak diberikan.");
      throw new functions.https.HttpsError("invalid-argument", "ID post tidak valid.");
    }
    
    functions.logger.info(`Admin (UID: ${context.auth.uid}) memulai proses penghapusan untuk postId: ${postId}`);
  
    try {
      const postRef = db.collection("posts").doc(postId);
  
      // Hapus sub-koleksi
      functions.logger.info(`Menghapus sub-koleksi untuk post ${postId}...`);
      await deleteCollection(`posts/${postId}/comments`, 50);
      functions.logger.info(`Sub-koleksi 'comments' untuk post ${postId} dihapus.`);
      await deleteCollection(`posts/${postId}/likes`, 50);
      functions.logger.info(`Sub-koleksi 'likes' untuk post ${postId} dihapus.`);
      await deleteCollection(`posts/${postId}/reports`, 50);
      functions.logger.info(`Sub-koleksi 'reports' untuk post ${postId} dihapus.`);
  
      // Hapus dokumen post utama
      await postRef.delete();
      functions.logger.info(`Dokumen utama post ${postId} berhasil dihapus.`);
  
      return { message: `Post ${postId} dan sub-koleksinya berhasil dihapus.` };
  
    } catch (error) {
      // LOG: Catat error yang detail sebelum dikirim ke client
      functions.logger.error(`Error saat menghapus post ${postId}:`, error);
      throw new functions.https.HttpsError("internal", "Terjadi kesalahan saat menghapus post.", error);
    }
});