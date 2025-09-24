import { useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/AuthContext'; 

const CF_VOTE_URL = 'https://us-central1-demokratos-5b0ce.cloudfunctions.net/votePolicy'; 

export const useVoting = (onVoteSuccess) => {
    const { currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingVote, setLoadingVote] = useState(false);
    const [errorVote, setErrorVote] = useState(null);

    const openModal = useCallback(() => {
        setIsModalOpen(true);
        setErrorVote(null);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const submitVote = useCallback(async (policyId, voteChoice, reason) => {
        if (!currentUser) {
            setErrorVote("Anda harus login untuk memberikan suara.");
            return;
        }

        setLoadingVote(true);
        setErrorVote(null);

        try {
            const idToken = await currentUser.getIdToken(true);
            
            const dataToSend = {
                policyId,
                vote: voteChoice, // 'yes' atau 'no'
                reason: reason.trim()
            };
            
            const response = await fetch(CF_VOTE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(dataToSend),
            });
            
            let result = await response.json();

            if (response.ok && result.status === 'success') {
                alert(result.message);
                closeModal();
                if (onVoteSuccess) {
                    onVoteSuccess(); // Refresh data detail setelah vote
                }
            } else {
                setErrorVote(result.message || `Gagal mengirim suara. Status: ${response.status}`);
            }

        } catch (err) {
            setErrorVote(`Gagal mengirim suara. Error: ${err.message}`);
        } finally {
            setLoadingVote(false);
        }
    }, [currentUser, closeModal, onVoteSuccess]);

    return {
        isModalOpen,
        openModal,
        closeModal,
        submitVote,
        loadingVote,
        errorVote
    };
};