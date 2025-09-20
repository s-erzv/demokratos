import { useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CF_DELETE_URL = 'https://us-central1-demokratos-5b0ce.cloudfunctions.net/deletePolicy'; 

export const usePolicyActions = (onSuccess) => {
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [errorDelete, setErrorDelete] = useState(null);
    const { currentUser } = useAuth();

    const deletePolicy = useCallback(async (policyId) => {
        if (!currentUser) {
            setErrorDelete("Anda tidak terautentikasi.");
            return;
        }

        if (!window.confirm("Apakah Anda yakin ingin menghapus kebijakan ini secara permanen?")) {
            return;
        }

        setLoadingDelete(true);
        setErrorDelete(null);

        try {
            const idToken = await currentUser.getIdToken(true);
            
            const response = await fetch(CF_DELETE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ policyId }),
            });
            
            const result = await response.json();

            if (response.ok && result.status === 'success') {
                alert("Kebijakan berhasil dihapus!");
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                setErrorDelete(result.message || `Gagal menghapus kebijakan. Status: ${response.status}`);
            }

        } catch (err) {
            setErrorDelete(`Gagal menghapus kebijakan. Error: ${err.message}`);
        } finally {
            setLoadingDelete(false);
        }
    }, [currentUser, onSuccess]);

    return {
        deletePolicy,
        loadingDelete,
        errorDelete,
    };
};