import { useState, useCallback } from 'react';
import { storage, functions } from '../firebase'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';

const createPolicyCallable = httpsCallable(functions, 'createPolicy');

export const useCreatePolicy = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const uploadFile = useCallback(async (file, path) => {
        if (!file) return null;

        const storageRef = ref(storage, `${path}/${file.name}_${Date.now()}`);
        await uploadBytes(storageRef, file); 
        
        return await getDownloadURL(storageRef);
    }, []);

    const createNewPolicy = useCallback(async (policyData, thumbnailFile, documentFile) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!thumbnailFile) {
            setError("Thumbnail wajib diunggah.");
            setLoading(false);
            return null;
        }

        try {
            setSuccess("Mengunggah file thumbnail...");
            const thumbnailUrl = await uploadFile(thumbnailFile, 'policy_thumbnails');
            
            let documentUrl = null;
            if (documentFile) {
                setSuccess("Mengunggah dokumen asli...");
                documentUrl = await uploadFile(documentFile, 'policy_documents');
            }
            
            setSuccess("Memproses data kebijakan di server...");
            const dataToSend = {
                ...policyData,
                thumbnailUrl,
                documentUrl,
            };

            const result = await createPolicyCallable(dataToSend);
            
            if (result.data.status === 'success') {
                 setSuccess(result.data.message);
                 return result.data.policyId; 
            } else {
                 setError(result.data.message || "Gagal membuat kebijakan karena masalah server.");
                 return null;
            }

        } catch (err) {
            console.error("Error creating policy:", err);
            const errorMessage = err.message || 'Terjadi kesalahan tidak dikenal.';
            setError(`Gagal membuat kebijakan. Error: ${errorMessage}`);
            return null;
        } finally {
            setLoading(false);
        }
    }, [uploadFile]);

    return {
        createNewPolicy,
        loading,
        error,
        success,
    };
};