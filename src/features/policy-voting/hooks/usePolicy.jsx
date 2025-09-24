import { createContext, useContext, useState, useCallback } from "react";
import { db, PolicyModel } from "../../../firebase";  
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../../hooks/AuthContext";

const PolicyContext = createContext();

export const PolicyProvider = ({ children }) => {
    const { userData } = useAuth();
    const isAdmin = userData?.role === "admin";

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("");
    const [sort, setSort] = useState("newest"); // Default sort

    const [sentimentReport, setSentimentReport] = useState("");
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    
    /**
     * Menganalisis sentimen dari diskusi yang terkait dengan suatu kebijakan.
     * @param {string} policyId - ID kebijakan yang akan dianalisis.
     */
    const analyzePolicySentiment = useCallback(async (policyId) => {
        if (!policyId) return;

        setLoadingAnalysis(true);
        setSentimentReport("");
        
        try { 
            const policyRef = doc(db, "policies", policyId);
            const policySnap = await getDoc(policyRef);
            if (!policySnap.exists()) throw new Error("Kebijakan tidak ditemukan.");
            const policyData = policySnap.data();
 
            const discussionsQuery = query(collection(db, "posts"), where("sourceId", "==", policyId));
            const discussionsSnapshot = await getDocs(discussionsQuery);
            
            const discussionsText = discussionsSnapshot.docs
                .map(doc => {
                    const data = doc.data(); 
                    return `Judul: "${data.question}"\nIsi: ${data.body || '(tidak ada deskripsi)'}`;
                })
                .join('\n\n---\n\n'); 
 
            const prompt = `
                Analisis sentimen untuk kebijakan pemerintah berjudul "${policyData.title}".
                
                Data Kuantitatif:
                - Total Suara Setuju: ${policyData.votesYes || 0}
                - Total Suara Tidak Setuju: ${policyData.votesNo || 0}

                Data Kualitatif dari Diskusi Publik:
                ${discussionsText.length > 0 ? discussionsText : "Tidak ada diskusi yang relevan."}

                TUGAS ANDA:
                Sebagai asisten analis kebijakan, berikan ringkasan satu paragraf (maksimal 10 kalimat) dalam Bahasa Indonesia.
                Ringkasan harus mencakup:
                1. Sentimen mayoritas berdasarkan data kuantitatif.
                2. Maksimal 2 tema utama atau kekhawatiran yang muncul dari diskusi publik.
                3. Satu rekomendasi singkat yang netral untuk pembuat kebijakan.
                
                Instruksi Output: Hasilkan teks biasa (plain text) tanpa karakter Markdown seperti *, #, -, atau :.
            `;
 
            const result = await PolicyModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setSentimentReport(text);
            setShowAnalysis(true);

        } catch (error) {
            console.error("Gagal melakukan analisis sentimen:", error);
            setSentimentReport(`Terjadi kesalahan saat menganalisis: ${error.message}`);
        } finally {
            setLoadingAnalysis(false);
        }
    }, []);


    return (
        <PolicyContext.Provider value={{ 
            isAdmin,
            loading, setLoading,
            searchTerm, setSearchTerm,
            filter, setFilter,
            sort, setSort,
            sentimentReport, loadingAnalysis, showAnalysis, setShowAnalysis,
            analyzePolicySentiment
        }}>
            {children}
        </PolicyContext.Provider>
    );
};

export const usePolicy = () => useContext(PolicyContext);