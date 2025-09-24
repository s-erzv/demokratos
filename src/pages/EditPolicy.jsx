import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import FloatingLabelInput from '../components/styling/FloatingLabelInput';
import { UploadCloud, ChevronDown, Loader2 } from 'lucide-react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { useUpdatePolicy } from '../features/policy-voting/hooks/useUpdatePolicy'; 

const InputStyle = "w-full border border-gray-300 rounded-full py-2.5 px-4 bg-gray-100 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all";

const EditPolicy = () => {
    const { policyId } = useParams();
    const navigate = useNavigate();
    
    // Gunakan useUpdatePolicy hook
    const { 
        initialData, 
        updatePolicy, 
        loading, 
        error, 
        success, 
        resetStatus 
    } = useUpdatePolicy(policyId);

    // State untuk formulir
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('kebijakan');
    const [deadline, setDeadline] = useState('');
    
    // State untuk file (hanya untuk file baru)
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [documentFile, setDocumentFile] = useState(null);

    // Sinkronkan state lokal dengan data yang diambil (initialData)
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setCategory(initialData.category || 'kebijakan');
            setDeadline(initialData.deadline || '');
        }
    }, [initialData]);

    // Efek untuk reset pesan error/success
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                resetStatus();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success, resetStatus]);

    const handleFileChange = (e, setFileState) => {
        if (e.target.files[0]) {
            setFileState(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !description || !deadline) {
            alert("Harap lengkapi semua data wajib.");
            return;
        }

        const dataToUpdate = {
            title,
            description,
            category,
            deadline,
        };

        const updateSuccess = await updatePolicy(dataToUpdate, thumbnailFile, documentFile);
        
        if (updateSuccess) {
            // Bersihkan file yang baru diupload setelah sukses
            setThumbnailFile(null);
            setDocumentFile(null);
            setTimeout(() => navigate('/vote'), 2000);
        }
    };

    if (loading && !initialData) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-[50vh]">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <p className="ml-3 text-lg text-gray-600">Memuat data kebijakan...</p>
                </div>
            </MainLayout>
        );
    }
    
    if (error && !initialData) {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto p-8 text-center mt-20">
                    <h1 className="text-3xl font-bold text-red-600">Error</h1>
                    <p className="text-gray-600 mt-4">{error}</p>
                    <button onClick={() => navigate('/vote')} className="mt-6 text-primary hover:underline">Kembali ke Daftar Vote</button>
                </div>
            </MainLayout>
        );
    }


    return (
        <MainLayout>
            <div className="bg-white p-8 rounded-xl shadow-lg mt-2">
                <h1 className="text-3xl font-bold text-primary mb-8 border-b pb-4">
                    Edit Kebijakan: {initialData?.title || policyId}
                </h1>
                
                {error && <p className="p-3 mb-4 text-center text-red-800 bg-red-100 rounded-lg">{error}</p>}
                {success && <p className="p-3 mb-4 text-center text-green-800 bg-green-100 rounded-lg">{success}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Baris Kontrol Atas (Kategori, Batas Waktu) */}
                    <div className="flex flex-col md:flex-row gap-6">
                        
                        {/* Kategori (Dropdown) */}
                        <div className="flex-1 relative">
                            <label htmlFor="category" className="text-sm font-medium text-gray-700 block mb-1">Kategori</label>
                            <div className="relative">
                                <select
                                    id="category"
                                    name="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                    className={`${InputStyle} pr-10 appearance-none`}
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
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                required
                                className={InputStyle}
                            />
                        </div>
                    </div>

                    {/* Judul Vote */}
                    <FloatingLabelInput 
                        id="title" 
                        name="title" 
                        label={`Judul Vote (Saat ini: ${initialData?.title})`} 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    
                    {/* Deskripsi Vote */}
                    <div>
                        <label htmlFor="description" className="text-sm font-medium text-gray-700">Deskripsi Vote</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Deskripsi Lengkap"
                            rows="6"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                        ></textarea>
                    </div>
                    
                    {/* Upload Thumbnail (File Input) */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Upload Thumbnail (Biarkan kosong untuk mempertahankan yang ada)</label>
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
                                Pilih File Thumbnail Baru
                            </label>
                            <span className="text-sm text-gray-500 truncate">
                                {thumbnailFile ? thumbnailFile.name : `Saat ini: ${initialData?.thumbnailUrl ? 'Link Tersedia' : 'Tidak Ada'}`}
                            </span>
                        </div>
                    </div>

                    {/* Upload Dokumen Asli (File Input) */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Upload Dokumen Asli (Biarkan kosong untuk mempertahankan yang ada)</label>
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
                                Pilih File Dokumen Baru
                            </label>
                            <span className="text-sm text-gray-500 truncate">
                                {documentFile ? documentFile.name : `Saat ini: ${initialData?.documentUrl ? 'Link Tersedia' : 'Tidak Ada'}`}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 font-bold bg-secondary text-white rounded-full hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                    >
                        {loading ? (
                             <Loader2 size={20} className="mr-2 animate-spin" />
                        ) : 'Simpan Perubahan'}
                    </button>

                </form>
            </div>
        </MainLayout>
    );
};

export default EditPolicy;