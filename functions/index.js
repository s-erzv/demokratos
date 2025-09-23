const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
// PENTING: Tambahkan ini untuk integrasi Gemini AI
const { GoogleGenAI } = require('@google/genai');

// Inisialisasi Firebase Admin
admin.initializeApp(); 

const db = admin.firestore();

// PENTING: Inisialisasi Gemini AI. 
// Cari kunci API di konfigurasi Firebase, atau di process.env (untuk local testing / runtime baru)
let geminiApiKey;

try {
    // Coba ambil dari konfigurasi Firebase (Metode lama/standar)
    geminiApiKey = functions.config().gemini.api_key;
} catch (e) {
    // Jika gagal (misalnya saat local testing atau menggunakan Node.js 18+ runtime baru)
    geminiApiKey = process.env.GEMINI_API_KEY;
}

if (!geminiApiKey) {
    console.error("GEMINI_API_KEY is not set in environment or Firebase config!");
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey });


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
                type: category, // 'category' dari frontend adalah 'type' di backend
                thumbnailUrl,
                documentUrl: documentUrl || null,
                dueDate: admin.firestore.Timestamp.fromDate(new Date(deadline)),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            
            await policyRef.update(updateData);
            
            return res.status(200).json({ 
                status: 'success', 
                message: 'Kebijakan berhasil diperbarui.',
            });
            
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

exports.getSentimentAnalysis = functions.https.onRequest((req, res) => {
    // URL Cloud Function di sini akan sama dengan yang di-deploy:
    // https://us-central1-demokratos-5b0ce.cloudfunctions.net/getSentimentAnalysis

    cors(req, res, async () => {
        
        if (req.method !== 'POST') {
            return res.status(405).send({ status: 'error', message: 'Method Not Allowed' });
        }

        const { policyId } = req.body;
        if (!policyId) {
            return res.status(400).json({ status: 'error', message: 'ID kebijakan wajib disertakan.' });
        }

        // Terapkan batas minimum partisipasi
        const MIN_PARTICIPATION = 5; 

        try {
            // 1. Ambil Data Kebijakan (untuk total vote dan judul)
            const policyRef = db.collection('policies').doc(policyId);
            const policySnap = await policyRef.get();

            if (!policySnap.exists) {
                return res.status(404).json({ status: 'error', message: 'Kebijakan tidak ditemukan.' });
            }
            const policyData = policySnap.data();

            const totalVotesCount = (policyData.votesYes || 0) + (policyData.votesNo || 0);

            if (totalVotesCount < MIN_PARTICIPATION) {
                 return res.status(200).json({ 
                    status: 'success', 
                    report: `Analisis Sentimen membutuhkan minimal ${MIN_PARTICIPATION} total suara. Saat ini hanya ada ${totalVotesCount} suara.`,
                    message: 'Partisipasi kurang untuk analisis.'
                });
            }

            // 2. Ambil Semua Alasan Voting (Aspirasi) yang Disimpan
            const votesCollection = db.collection('votes');
            const votesQuery = votesCollection.where('policyId', '==', policyId);
            const votesSnapshot = await votesQuery.get();

            let votesData = {
                yes: policyData.votesYes || 0,
                no: policyData.votesNo || 0,
                reasons: []
            };

            votesSnapshot.forEach(doc => {
                const data = doc.data();
                // Hanya masukkan alasan (reason) yang valid/diisi
                if (data.reason && typeof data.reason === 'string' && data.reason.trim().length > 0) {
                    votesData.reasons.push({
                        choice: data.choice, // 'yes' or 'no'
                        reason: data.reason.trim()
                    });
                }
            });

            // 3. Persiapkan Prompt untuk Gemini AI
            const totalVotes = votesData.yes + votesData.no;
            const percentageYes = totalVotes > 0 ? ((votesData.yes / totalVotes) * 100).toFixed(1) : 50.0;
            const percentageNo = totalVotes > 0 ? ((votesData.no / totalVotes) * 100).toFixed(1) : 50.0;
            const primarySentiment = votesData.yes >= votesData.no ? 'POSITIF (Setuju)' : 'NEGATIF (Tidak Setuju)';
            const primaryPercentage = votesData.yes >= votesData.no ? percentageYes : percentageNo;
            const secondaryPercentage = votesData.yes >= votesData.no ? percentageNo : percentageYes;
            const secondarySentiment = votesData.yes >= votesData.no ? 'NEGATIF (Tidak Setuju)' : 'POSITIF (Setuju)';

            const reasonsText = votesData.reasons.map(r => `[${r.choice.toUpperCase()}]: ${r.reason}`).join('\n');

             const aiPrompt = `
                Lakukan analisis sentimen singkat dan padat untuk kebijakan: "${policyData.title}" berdasarkan data berikut.

                DATA INPUT:
                Sentimen Mayoritas: ${primarySentiment} (${primaryPercentage}%)
                Total Setuju: ${votesData.yes}
                Total Tidak Setuju: ${votesData.no}
                Aspirasi Utama: ${reasonsText.length > 0 ? reasonsText : 'Tidak ada alasan tambahan yang dicatat.'}

                TUGAS:
                Hasilkan SATU paragraf teks dalam Bahasa Indonesia. Teks ini harus:
                1. Ringkas dan lugas (Maksimal 10 kalimat).
                2. Mencakup kesimpulan sentimen mayoritas dan dua (maksimal) tema alasan utama.
                3. Ditutup dengan satu kalimat rekomendasi/aksi singkat.
                4. Dilarang keras menggunakan karakter Markdown seperti *, #, -, :, kurung siku, atau new line ganda. Output harus berupa plain text satu paragraf.
                `;

            // 4. Panggil Gemini API
            const geminiResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash', 
                contents: aiPrompt,
            });
            
            const sentimentReport = geminiResponse.text;

            return res.status(200).json({ 
                status: 'success', 
                report: sentimentReport,
                message: 'Analisis sentimen berhasil dibuat oleh Gemini AI.'
            });

        } catch (err) {
            console.error("Error generating sentiment analysis:", err);
            return res.status(500).json({ 
                status: 'error', 
                message: `Gagal memproses analisis sentimen. Error: ${err.message}. Pastikan GEMINI_API_KEY sudah diatur.` 
            });
        }
    });
});