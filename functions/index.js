const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp(); 
const db = admin.firestore();

let genAI;
try {
    const geminiApiKey = functions.config().gemini.api_key || process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY not found.");
    }
    genAI = new GoogleGenerativeAI(geminiApiKey);
} catch (e) {
    console.error("Gagal menginisialisasi Gemini AI:", e.message);
}

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
      resolve();
      return;
    }
  
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  
    process.nextTick(() => {
      deleteQueryBatch(query, resolve);
    });
}

exports.submitPolicy = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

        const { authorization } = req.headers;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({ status: 'error', message: 'Anda harus login.' });
        }

        try {
            const idToken = authorization.split('Bearer ')[1];
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const userId = decodedToken.uid;
            const userDoc = await db.collection('users').doc(userId).get();
            
            if (!userDoc.exists || userDoc.data().role !== 'admin') {
                return res.status(403).json({ status: 'error', message: 'Hanya Admin yang dapat membuat kebijakan.' });
            }

            const { title, description, category, deadline, thumbnailUrl, documentUrl } = req.body;
            if (!title || !description || !category || !deadline || !thumbnailUrl) {
                return res.status(400).json({ status: 'error', message: 'Data kebijakan wajib diisi.' });
            }

            const newPolicyData = {
                title, description, thumbnailUrl,
                type: category,
                documentUrl: documentUrl || null,
                votesYes: 0, votesNo: 0,
                status: 'Active', 
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                dueDate: admin.firestore.Timestamp.fromDate(new Date(deadline)), 
                authorId: userId,
            };

            const docRef = await db.collection('policies').add(newPolicyData);
            return res.status(200).json({ status: 'success', message: 'Kebijakan berhasil dibuat.', policyId: docRef.id });

        } catch (error) {
            console.error("Submit policy error:", error);
            return res.status(500).json({ status: 'error', message: `Terjadi kesalahan server: ${error.message}` });
        }
    });
});

exports.updatePolicy = functions.https.onRequest((req, res) => {
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
                return res.status(403).json({ status: 'error', message: 'Hanya Admin yang dapat memperbarui kebijakan.' });
            }
        } catch (error) {
            return res.status(500).json({ status: 'error', message: 'Gagal memverifikasi peran pengguna.' });
        }
        
        const { policyId, title, description, category, deadline, thumbnailUrl, documentUrl } = req.body;
        
        if (!policyId || !title || !description || !category || !deadline || !thumbnailUrl) {
            return res.status(400).json({ status: 'error', message: 'Semua data kebijakan wajib diisi (kecuali documentUrl).' });
        }
        
        const validCategories = ['kebijakan', 'program'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ status: 'error', message: 'Kategori harus "kebijakan" atau "program".' });
        }

        try {
            const policyRef = db.collection('policies').doc(policyId);
            
            const updateData = {
                title,
                description,
                type: category,
                thumbnailUrl,
                documentUrl: documentUrl || null,
                dueDate: admin.firestore.Timestamp.fromDate(new Date(deadline)),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            
            await policyRef.update(updateData);
            
            return res.status(200).json({ status: 'success', message: 'Kebijakan berhasil diperbarui.' });
            
        } catch (error) {
            if (error.code === 'not-found') {
                return res.status(404).json({ status: 'error', message: 'Kebijakan tidak ditemukan.' });
            }
            console.error("Error updating policy:", error);
            return res.status(500).json({ status: 'error', message: `Gagal memperbarui kebijakan. ${error.message}` });
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
            
            return res.status(200).json({ status: 'success', message: 'Kebijakan berhasil dihapus.' });
            
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
        
        const userVoteDocRef = db.collection('votes').doc(`${userId}_${policyId}`);

        try {
            const userVoteSnap = await userVoteDocRef.get();

            if (userVoteSnap.exists) {
                return res.status(403).json({ status: 'error', message: 'Anda sudah pernah memberikan suara untuk kebijakan ini.' });
            }
            
            const voteField = vote === 'yes' ? 'votesYes' : 'votesNo';

            await db.runTransaction(async (transaction) => {
                const policyRef = db.collection('policies').doc(policyId);
                transaction.update(policyRef, {
                    [voteField]: admin.firestore.FieldValue.increment(1)
                });
                transaction.set(userVoteDocRef, {
                    policyId: policyId,
                    userId: userId,
                    choice: vote,
                    reason: reason || null,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            });
            
            return res.status(200).json({ status: 'success', message: `Suara Anda berhasil dicatat.` });
            
        } catch (error) {
            console.error("Error processing vote transaction:", error);
            if (error.code === 'not-found') {
                return res.status(404).json({ status: 'error', message: 'Kebijakan yang Anda vote tidak ditemukan.' });
            }
            return res.status(500).json({ status: 'error', message: `Gagal mencatat suara. ${error.message}` });
        }
    });
});

exports.getSentimentAnalysis = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (!genAI) {
            return res.status(500).json({ status: 'error', message: 'Layanan AI tidak terinisialisasi.' });
        }
        
        if (req.method !== 'POST') {
            return res.status(405).send({ status: 'error', message: 'Method Not Allowed' });
        }

        const { policyId } = req.body;
        if (!policyId) {
            return res.status(400).json({ status: 'error', message: 'ID kebijakan wajib disertakan.' });
        }

        try {
            const policyRef = db.collection('policies').doc(policyId);
            const policySnap = await policyRef.get();
            if (!policySnap.exists) {
                return res.status(404).json({ status: 'error', message: 'Kebijakan tidak ditemukan.' });
            }
            const policyData = policySnap.data();

            const MIN_PARTICIPATION = 5; 
            const totalVotesCount = (policyData.votesYes || 0) + (policyData.votesNo || 0);

            if (totalVotesCount < MIN_PARTICIPATION) {
                 return res.status(200).json({ status: 'success', report: `Analisis membutuhkan minimal ${MIN_PARTICIPATION} suara. Saat ini hanya ada ${totalVotesCount} suara.` });
            }

            const votesSnapshot = await db.collection('votes').where('policyId', '==', policyId).get();
            const reasons = votesSnapshot.docs
                .map(doc => doc.data())
                .filter(data => data.reason && data.reason.trim().length > 0)
                .map(data => `[${data.choice.toUpperCase()}]: ${data.reason.trim()}`);
            
            const reasonsText = reasons.length > 0 ? reasons.join('\n') : 'Tidak ada alasan tambahan yang dicatat.';

            const aiPrompt = `
                Analisis sentimen untuk kebijakan: "${policyData.title}".
                Data: Total Setuju ${policyData.votesYes}, Total Tidak Setuju ${policyData.votesNo}.
                Aspirasi:
                ${reasonsText}

                TUGAS: Hasilkan SATU paragraf ringkas (max 10 kalimat) dalam Bahasa Indonesia yang merangkum sentimen mayoritas, maksimal 2 tema utama dari aspirasi, dan satu rekomendasi singkat. Output harus berupa plain text satu paragraf tanpa karakter Markdown (*, #, -, :).`;

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
            const result = await model.generateContent(aiPrompt);
            const response = await result.response;
            const sentimentReport = response.text();

            return res.status(200).json({ status: 'success', report: sentimentReport });

        } catch (err) {
            console.error("Error generating sentiment analysis:", err);
            return res.status(500).json({ status: 'error', message: `Gagal memproses analisis sentimen. Error: ${err.message}.` });
        }
    });
});

exports.deletePost = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
      // 1. Validasi method & autentikasi (sama seperti submitPolicy)
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }
      const { authorization } = req.headers;
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'Anda harus login.' });
      }
  
      try {
        // 2. Verifikasi token & peran admin dari database (sama seperti submitPolicy)
        const idToken = authorization.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.uid;
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists || userDoc.data().role !== 'admin') {
          return res.status(403).json({ status: 'error', message: 'Hanya Admin yang dapat menghapus post.' });
        }
  
        // 3. Logika inti untuk deletePost
        const { postId } = req.body;
        if (!postId) {
          return res.status(400).json({ status: 'error', message: 'ID post tidak valid.' });
        }
  
        const postRef = db.collection('posts').doc(postId);

        await db.recursiveDelete(postRef); 

        const reportsQuery = db.collection('reports').where('postId', '==', postId);
        const reportsSnapshot = await reportsQuery.get();

        if (!reportsSnapshot.empty) {
            const batch = db.batch();
            reportsSnapshot.docs.forEach(doc => {
              batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`${reportsSnapshot.size} laporan terkait berhasil dihapus.`);
        }
        
        return res.status(200).json({ status: 'success', message: 'Post berhasil dihapus.' });
  
      } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).json({ status: 'error', message: `Terjadi kesalahan server: ${error.message}` });
      }
    });
});

exports.dismissReport = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
      // 1. Validasi method & autentikasi (sama seperti submitPolicy)
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }
      const { authorization } = req.headers;
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'Anda harus login.' });
      }
  
      try {
        // 2. Verifikasi token & peran admin dari database (sama seperti submitPolicy)
        const idToken = authorization.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.uid;
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists || userDoc.data().role !== 'admin') {
          return res.status(403).json({ status: 'error', message: 'Hanya Admin yang dapat mengabaikan laporan.' });
        }
  
        // 3. Logika inti untuk dismissReport
        const { reportId } = req.body;
        if (!reportId) {
          return res.status(400).json({ status: 'error', message: 'ID laporan tidak valid.' });
        }
  
        const reportRef = db.collection('reports').doc(reportId);
        await reportRef.delete();
  
        return res.status(200).json({ status: 'success', message: 'Laporan berhasil diabaikan.' });
  
      } catch (error) {
        console.error("Error dismissing report:", error);
        return res.status(500).json({ status: 'error', message: `Terjadi kesalahan server: ${error.message}` });
      }
    });
});