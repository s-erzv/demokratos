const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp(); 

const db = admin.firestore();

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