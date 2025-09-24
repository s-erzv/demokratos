import { useState, useCallback } from 'react';
import { storage, functions } from '../../../firebase'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../../hooks/AuthContext'; 
 
const CF_URL = 'https://us-central1-demokratos-5b0ce.cloudfunctions.net/submitPolicy'; 

export const useCreatePolicy = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const { currentUser } = useAuth(); 
     
    const resetStatus = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

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
         
        if (!currentUser) {
            setError("Anda tidak terautentikasi. Silakan login ulang.");
            setLoading(false);
            return null;
        }

        try { 
            const idToken = await currentUser.getIdToken(true); 
            console.log(`[DEBUG] Token diambil, panjang token: ${idToken.length} karakter.`);
 
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
 
            const response = await fetch(CF_URL, {
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
                console.error("Server returned non-JSON error:", await response.text());
                throw new Error(`Permintaan gagal dengan status ${response.status}. Cek log Cloud Function.`);
            }
 
            if (response.ok && result.status === 'success') {
                 setSuccess(result.message);
                 return result.policyId; 
            } else { 
                 setError(result.message || `Gagal membuat kebijakan. Status: ${response.status}`);
                 return null;
            }

        } catch (err) {
            console.error("Error creating policy:", err);
            setError(`Gagal membuat kebijakan. Error: ${err.message}`);
            return null;
        } finally {
            setLoading(false);
        }
    }, [uploadFile, currentUser]);

    return {
        createNewPolicy,
        loading,
        error,
        success,
        resetStatus, 
    };
};