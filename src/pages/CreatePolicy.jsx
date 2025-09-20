import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import FloatingLabelInput from '../components/styling/FloatingLabelInput';
import { Calendar, UploadCloud, ChevronDown } from 'lucide-react'; 
// Import functions untuk memanggil Cloud Function
import { db, storage, functions } from '../firebase'; 
import { httpsCallable } from 'firebase/functions'; // Import httpsCallable
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

const createPolicyCallable = httpsCallable(functions, 'createPolicy'); // Deklarasi fungsi yang akan dipanggil

const CreatePolicy = () => {
    const navigate = useNavigate();
    const [policyData, setPolicyData] = useState({
        title: '',
        description: '',
        category: 'kebijakan',
        deadline: '',
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [documentFile, setDocumentFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0); // Tambahkan state progress

    const handleChange = (e) => {
        setPolicyData({ ...policyData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, setFileState) => {
        if (e.target.files[0]) {
            setFileState(e.target.files[0]);
        }
    };

    // Fungsi utilitas untuk mengunggah file ke Firebase Storage
    const uploadFile = async (file, path) => {
        if (!file) return null;

        const storageRef = ref(storage, `${path}/${file.name}_${Date.now()}`);
        
        // Asumsi uploadBytes sudah cukup, untuk progress bar lebih kompleks butuh uploadBytesResumable
        await uploadBytes(storageRef, file); 
        
        return await getDownloadURL(storageRef);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!policyData.title || !policyData.description || !policyData.deadline || !thumbnailFile) {
            setError("Harap lengkapi Judul, Deskripsi, Batas Waktu, dan Thumbnail.");
            setLoading(false);
            return;
        }

        try {
            // 1. Upload Thumbnail ke Storage
            setSuccess("Mengunggah file thumbnail...");
            const thumbnailUrl = await uploadFile(thumbnailFile, 'policy_thumbnails');
            
            // 2. Upload Dokumen Asli (jika ada) ke Storage
            let documentUrl = null;
            if (documentFile) {
                setSuccess("Mengunggah dokumen asli...");
                documentUrl = await uploadFile(documentFile, 'policy_documents');
            }
            
            // 3. Panggil Cloud Function untuk memproses dan menyimpan data
            setSuccess("Memproses data kebijakan di server...");
            const dataToSend = {
                ...policyData,
                deadline: policyData.deadline, // Kirim sebagai string
                thumbnailUrl,
                documentUrl,
            };

            const result = await createPolicyCallable(dataToSend);
            
            if (result.data.status === 'success') {
                 setSuccess("Kebijakan berhasil dibuat dan dipublikasikan!");
                 setTimeout(() => navigate('/vote'), 2000); 
            } else {
                // Tangani error dari Cloud Function (misal, moderasi AI gagal)
                 setError(result.data.message || "Gagal membuat kebijakan karena masalah server.");
            }

        } catch (err) {
            console.error("Error creating policy (via function):", err);
            setError(`Gagal membuat kebijakan. Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-5">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">
                    Buat Vote Kebijakan Baru
                </h1>

                {error && <p className="p-3 mb-4 text-center text-red-800 bg-red-100 rounded-lg">{error}</p>}
                {success && <p className="p-3 mb-4 text-center text-green-800 bg-green-100 rounded-lg">{success}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ... (Field input lainnya sama) ... */}

                    {/* Baris Kontrol Atas (Kategori, Batas Waktu) */}
                    <div className="flex flex-col md:flex-row gap-6">
                        
                        {/* Kategori (Dropdown) */}
                        <div className="flex-1 relative">
                            <label htmlFor="category" className="text-sm font-medium text-gray-700 block mb-1">Kategori</label>
                            <div className="relative">
                                <select
                                    id="category"
                                    name="category"
                                    value={policyData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-full py-2.5 px-4 pr-10 bg-gray-100 text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="kebijakan">Kebijakan Pemerintah</option>
                                    <option value="program">Program Pemerintah</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Batas Waktu Vote (Date Input) */}
                        <div className="flex-1 relative">
                            <label htmlFor="deadline" className="text-sm font-medium text-gray-700 block mb-1">Batas Waktu Vote</label>
                            <input
                                id="deadline"
                                name="deadline"
                                type="date"
                                value={policyData.deadline}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-full py-2.5 px-4 bg-gray-100 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <Calendar className="absolute right-3 bottom-2 h-5 w-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Judul Vote */}
                    <FloatingLabelInput 
                        id="title" 
                        name="title" 
                        label="Judul Vote (Contoh: Kenaikan Gaji DPR)" 
                        type="text" 
                        value={policyData.title}
                        onChange={handleChange}
                    />
                    
                    {/* Deskripsi Vote */}
                    <div>
                        <label htmlFor="description" className="text-sm font-medium text-gray-700">Deskripsi Vote</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Deskripsi Lengkap"
                            rows="6"
                            value={policyData.description}
                            onChange={handleChange}
                            required
                            className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                        ></textarea>
                    </div>

                    {/* Upload Thumbnail (File Input) */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Upload Thumbnail (Gambar)</label>
                        <div className="flex items-center space-x-4">
                            <input 
                                type="file" 
                                id="thumbnail-upload" 
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, setThumbnailFile)}
                                className="hidden" 
                            />
                            <label 
                                htmlFor="thumbnail-upload" 
                                className="flex items-center justify-center bg-gray-100 text-gray-700 border border-gray-300 rounded-full py-2 px-4 cursor-pointer hover:bg-gray-200 transition-colors"
                            >
                                <UploadCloud size={20} className="mr-2" />
                                Pilih File Thumbnail
                            </label>
                            <span className="text-sm text-gray-500 truncate">
                                {thumbnailFile ? thumbnailFile.name : 'Belum ada file dipilih.'}
                            </span>
                        </div>
                    </div>

                    {/* Upload Dokumen Asli (File Input) */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Upload Dokumen Asli (PDF/DOC, Opsional)</label>
                        <div className="flex items-center space-x-4">
                            <input 
                                type="file" 
                                id="document-upload" 
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => handleFileChange(e, setDocumentFile)}
                                className="hidden" 
                            />
                            <label 
                                htmlFor="document-upload" 
                                className="flex items-center justify-center bg-gray-100 text-gray-700 border border-gray-300 rounded-full py-2 px-4 cursor-pointer hover:bg-gray-200 transition-colors"
                            >
                                <UploadCloud size={20} className="mr-2" />
                                Pilih File Dokumen
                            </label>
                            <span className="text-sm text-gray-500 truncate">
                                {documentFile ? documentFile.name : 'Belum ada file dipilih.'}
                            </span>
                        </div>
                    </div>


                    {/* Tombol Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 font-bold bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                    >
                        {loading ? 'Membuat Kebijakan...' : 'Buat & Publikasikan Vote'}
                    </button>

                </form>
            </div>
        </MainLayout>
    );
};

export default CreatePolicy;