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
            console.error("Error verifying ID Token:", error);
            return res.status(401).json({ status: 'error', message: 'Token tidak valid atau kedaluwarsa. Silakan login ulang.' });
        }

        try {
            const userDoc = await db.collection('users').doc(userId).get();
            
            if (!userDoc.exists || userDoc.data().role !== 'admin') {
                return res.status(403).json({ status: 'error', message: 'Hanya Admin yang dapat membuat kebijakan.' });
            }

        } catch (error) {
            console.error("Error checking user role:", error);
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
            console.error("Error writing new policy to Firestore:", error);
            return res.status(500).json({ status: 'error', message: 'Gagal menyimpan kebijakan ke database.' });
        }
    });
});