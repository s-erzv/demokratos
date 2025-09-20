const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(); 

const db = admin.firestore();
exports.createPolicy = functions.https.onCall(async (data, context) => {
    
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Anda harus login untuk mengakses fitur ini.');
    }
    
    const userId = context.auth.uid;

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists || userDoc.data().role !== 'admin') {
            throw new functions.https.HttpsError('permission-denied', 'Hanya Admin yang dapat membuat kebijakan.');
        }

    } catch (error) {
        console.error("Error checking user role:", error);
        throw new functions.https.HttpsError('internal', 'Gagal memverifikasi peran pengguna.');
    }

    const { title, description, category, deadline, thumbnailUrl, documentUrl } = data;
    
    if (!title || !description || !category || !deadline || !thumbnailUrl) {
        throw new functions.https.HttpsError('invalid-argument', 'Data kebijakan (Judul, Deskripsi, Kategori, Batas Waktu, dan Thumbnail) wajib diisi.');
    }
    
    const validCategories = ['kebijakan', 'program'];
    if (!validCategories.includes(category)) {
        throw new functions.https.HttpsError('invalid-argument', 'Kategori harus "kebijakan" atau "program".');
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
        return { 
            status: 'success', 
            message: 'Kebijakan berhasil dibuat dan dipublikasikan.',
            policyId: docRef.id
        };
    } catch (error) {
        console.error("Error writing new policy to Firestore:", error);
        throw new functions.https.HttpsError('unknown', 'Gagal menyimpan kebijakan ke database.');
    }
});