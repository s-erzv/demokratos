import React, { useState, useEffect } from 'react';
import { Calendar, UploadCloud, ChevronDown, Loader2, PlusCircle } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext'; 
import { useCreatePolicy } from '../../hooks/useCreatePolicy'; 

const InputStyle = "w-full border border-gray-300 rounded-full py-2.5 px-4 bg-gray-100 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all";
const LabelStyle = "text-sm font-medium text-gray-700 block mb-1";
const FileButton = "flex items-center justify-center bg-gray-100 text-gray-700 border border-gray-300 rounded-full py-2 px-4 cursor-pointer hover:bg-gray-200 transition-colors";


const PolicyVotingFeature = () => {
    const navigate = useNavigate();
    const { userData, currentUser, loading: authLoading } = useAuth(); 
    const isAdmin = userData?.role === 'admin'; 
    
    const { createNewPolicy, loading, error, success, resetStatus } = useCreatePolicy(); 

    const [policyData, setPolicyData] = useState({
        title: '',
        description: '',
        category: 'kebijakan', 
        deadline: '',
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [documentFile, setDocumentFile] = useState(null);
     
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                resetStatus(); 
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success, resetStatus]); 
 
    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-screen -mt-20">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-gray-600">Memuat data otentikasi...</p>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setPolicyData({ ...policyData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, setFileState) => {
        if (e.target.files[0]) {
            setFileState(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!policyData.title || !policyData.description || !policyData.deadline || !thumbnailFile) {
            alert("Harap lengkapi semua data wajib (Judul, Deskripsi, Batas Waktu, dan Thumbnail).");
            return;
        }
 
        const policyId = await createNewPolicy(policyData, thumbnailFile, documentFile);
        
        if (policyId) { 
             setPolicyData({ title: '', description: '', category: 'kebijakan', deadline: '' });
             setThumbnailFile(null);
             setDocumentFile(null); 
             setTimeout(() => navigate('/vote'), 2000); 
        }
    };

    return (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-5">
                <h1 className="text-3xl font-bold text-primary mb-8 border-b pb-4 flex items-center">
                    <PlusCircle size={28} className="mr-3" />
                    Buat Vote Kebijakan Baru
                </h1>
 
                <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg text-sm text-blue-800">
                    <p className="font-bold mb-1">DEBUG INFO (Client Status):</p>
                    <p>Status Loading Autentikasi: <span className="font-semibold">{authLoading ? 'TRUE' : 'FALSE'}</span></p>
                    <p>User UID: <span className="font-semibold">{currentUser ? currentUser.uid : 'NULL (Belum Login)'}</span></p>
                    <p>User Role: <span className="font-semibold">{userData?.role || 'Tidak Tersedia'}</span></p>
                    <p>Status Admin: <span className="font-semibold">{isAdmin ? 'YA' : 'TIDAK'}</span></p>
                    <p className="font-bold mt-2">STATUS: Menggunakan work-around onRequest + Manual Auth Check (Fungsi: submitPolicy).</p>
                </div> 
                {error && <p className="p-3 mb-4 text-center text-red-800 bg-red-100 rounded-lg">{error}</p>}
                {success && <p className="p-3 mb-4 text-center text-green-800 bg-green-100 rounded-lg">{success}</p>}


                <form onSubmit={handleSubmit} className="space-y-6">
                     
                    <div className="flex flex-col md:flex-row gap-6">
                         
                        <div className="flex-1 relative">
                            <label htmlFor="category" className={LabelStyle}>Tipe Konten</label>
                            <div className="relative">
                                <select
                                    id="category"
                                    name="category"
                                    value={policyData.category}
                                    onChange={handleChange}
                                    required
                                    className={`${InputStyle} pr-10 appearance-none`}
                                >
                                    <option value="kebijakan">Kebijakan Pemerintah</option>
                                    <option value="program">Program Pemerintah</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
 
                        <div className="flex-1 relative">
                            <label htmlFor="deadline" className={LabelStyle}>Batas Waktu Vote</label>
                            <input
                                id="deadline"
                                name="deadline"
                                type="date"
                                value={policyData.deadline}
                                onChange={handleChange}
                                required
                                className={InputStyle}
                            />
                            <Calendar className="absolute right-3 bottom-2 h-5 w-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
 
                    <div>
                        <label htmlFor="title" className={LabelStyle}>Judul Vote</label>
                        <input 
                            id="title" 
                            name="title" 
                            type="text" 
                            value={policyData.title}
                            onChange={handleChange}
                            required
                            placeholder="Contoh: Kenaikan Gaji DPR"
                            className={InputStyle}
                        />
                    </div>
                     
                    <div>
                        <label htmlFor="description" className={LabelStyle}>Deskripsi Vote</label>
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
 
                    <div>
                        <label className={LabelStyle}>Upload Thumbnail (Gambar Wajib)</label>
                        <div className="flex items-center space-x-4">
                            <input 
                                type="file" 
                                id="thumbnail-upload" 
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, setThumbnailFile)}
                                className="hidden" 
                                required 
                            />
                            <label 
                                htmlFor="thumbnail-upload" 
                                className={FileButton}
                            >
                                <UploadCloud size={20} className="mr-2" />
                                Pilih File Thumbnail
                            </label>
                            <span className="text-sm text-gray-500 truncate">
                                {thumbnailFile ? thumbnailFile.name : 'Belum ada file dipilih.'}
                            </span>
                        </div>
                    </div>
 
                    <div>
                        <label className={LabelStyle}>Upload Dokumen Asli (PDF/DOC, Opsional)</label>
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
                                className={FileButton}
                            >
                                <UploadCloud size={20} className="mr-2" />
                                Pilih File Dokumen
                            </label>
                            <span className="text-sm text-gray-500 truncate">
                                {documentFile ? documentFile.name : 'Belum ada file dipilih.'}
                            </span>
                        </div>
                    </div>

 
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 font-bold bg-primary text-white rounded-full hover:bg-red-800 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                    >
                        {loading ? (
                            <Loader2 size={20} className="mr-2 animate-spin" />
                        ) : 'Buat & Publikasikan Vote'}
                    </button>

                </form>
            </div>
    );
};

export default PolicyVotingFeature;