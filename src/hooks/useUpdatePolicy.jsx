import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CF_UPDATE_URL = 'https://us-central1-demokratos-5b0ce.cloudfunctions.net/updatePolicy';

export const useUpdatePolicy = (policyId) => {
    const { currentUser } = useAuth();
    
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const resetStatus = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    // Fetch data awal kebijakan
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!policyId) {
                setError("ID Kebijakan tidak valid.");
                setLoading(false);
                return;
            }
            try {
                const docRef = doc(db, 'policies', policyId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    
                    // Format tanggal dari Firestore Timestamp ke string YYYY-MM-DD
                    const dueDate = data.dueDate.toDate();
                    const formattedDate = dueDate.toISOString().split('T')[0];

                    setInitialData({
                        ...data,
                        id: docSnap.id,
                        deadline: formattedDate, // Gunakan nama field yang benar
                        category: data.type, // Sesuaikan category dengan type
                    });
                } else {
                    setError("Kebijakan tidak ditemukan.");
                }
            } catch (err) {
                setError("Gagal memuat data kebijakan.");
                console.error("Error fetching policy for edit:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [policyId]);

    const uploadFile = useCallback(async (file, path) => {
        if (!file) return null;
        const storageRef = ref(storage, `${path}/${file.name}_${Date.now()}`);
        await uploadBytes(storageRef, file); 
        return await getDownloadURL(storageRef);
    }, []);

    const updatePolicy = useCallback(async (policyData, thumbnailFile, documentFile) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!currentUser) {
            setError("Anda harus login untuk memperbarui kebijakan.");
            setLoading(false);
            return null;
        }

        try {
            const idToken = await currentUser.getIdToken(true);
            let thumbnailUrl = policyData.thumbnailUrl || initialData.thumbnailUrl;
            let documentUrl = policyData.documentUrl || initialData.documentUrl;

            if (thumbnailFile) {
                setSuccess("Mengunggah thumbnail baru...");
                thumbnailUrl = await uploadFile(thumbnailFile, 'policy_thumbnails');
            }
            
            if (documentFile) {
                setSuccess("Mengunggah dokumen baru...");
                documentUrl = await uploadFile(documentFile, 'policy_documents');
            }
            
            setSuccess("Mengirim pembaruan ke server...");
            const dataToSend = {
                policyId: policyId,
                title: policyData.title,
                description: policyData.description,
                category: policyData.category,
                deadline: policyData.deadline,
                thumbnailUrl: thumbnailUrl,
                documentUrl: documentUrl,
            };

            const response = await fetch(CF_UPDATE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(dataToSend),
            });
            
            let result;
            try {
                result = await response.json();
            } catch (e) {
                throw new Error(`Permintaan gagal dengan status ${response.status}.`);
            }

            if (response.ok && result.status === 'success') {
                 setSuccess("Kebijakan berhasil diperbarui!");
                 return true;
            } else {
                 setError(result.message || `Gagal memperbarui kebijakan. Status: ${response.status}`);
                 return false;
            }

        } catch (err) {
            setError(`Gagal memperbarui kebijakan. Error: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    }, [policyId, currentUser, initialData, uploadFile]);

    return {
        initialData,
        updatePolicy,
        loading,
        error,
        success,
        resetStatus,
    };
};