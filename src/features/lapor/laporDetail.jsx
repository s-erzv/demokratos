import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { doc, getDoc, increment, updateDoc, writeBatch } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { MapPin, User } from "lucide-react";
import { useAuth } from "../../hooks/AuthContext";
import { useLapor } from "./hooks/useLapor";
import StatusModel from "./component/statusModal";
import PolicyDiscussionList from "../discussion/PolicyDiscussionList";
import DiscussionForm from "../discussion/DiscussionForm";

const statusStyles = {
  "Baru diajukan": "bg-yellow-100 text-yellow-800",
  "Dalam Verifikasi": "bg-yellow-100 text-yellow-800",
  "Dalam Pengerjaan": "bg-blue-100 text-blue-800",
  "Selesai": "bg-green-100 text-green-800",
  "Ditolak": "bg-red-100 text-red-800",
  "default": "bg-gray-100 text-gray-800" 
};

export default function LaporDetail(){
    const [isDiscussion, setIsDiscussion] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useAuth();
    const { laporanId } = useParams()
    const { userData } = useAuth()
    const { isAdmin, setShowStatus, analisisLaporan, fetchDiskusi, hasilLaporAnalisis, showAnalisis, setShowAnalisis, analisisLoading } = useLapor()

    const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const [laporan, setLaporan] = useState([])

    const triggerRefresh = () => setRefreshKey(prevKey => prevKey + 1);

    async function fetchData(){
        const docRef = doc(db, `laporan/${laporanId}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setLaporan(docSnap.data());
        } else {
            console.log("No such document!");
        }
    }

    async function upVote() {
        if (!userData) {
            alert("Anda harus login untuk memberikan upvote!");
            return;
        }

        const uid = userData.uid ;
        
        const laporanRef = doc(db, "laporan", laporanId);
        const pendukungRef = doc(laporanRef, "pendukung", uid);

        try {
            const docSnap = await getDoc(pendukungRef);

            if (docSnap.exists()) {
                alert("Anda sudah pernah mendukung laporan ini.");
                return;
            }
            const batch = writeBatch(db);

            batch.update(laporanRef, { pendukung: increment(1) });

            batch.set(pendukungRef, { createdAt: new Date() });

            await batch.commit();

            fetchData()
            
            console.log("Upvote berhasil!");

        } catch (error) {
            console.error("Gagal memberikan upvote: ", error);
        }
    }

    async function handleStatus(newStatus){
        try {
            const laporanRef = doc(db, "laporan", laporanId);

            await updateDoc(laporanRef, {
                status: newStatus
            });

            fetchData()

        } catch (error) {
            console.error("Error updating document status: ", error);
        }
    }

    useEffect(() => {
        fetchData()
        fetchDiskusi(laporanId)
    }, [laporanId])

    const fetchLaporan = async () => {
        const docRef = doc(db, "laporan", laporanId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setLaporan({ id: docSnap.id, ...docSnap.data() });
        } else {
            console.log("Laporan tidak ditemukan!");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLaporan();
    }, [laporanId, refreshKey]);

    if (loading) return <p>Memuat laporan...</p>;
    if (!laporan) return <p>Laporan tidak ditemukan.</p>;

    const textAnalisisButton = analisisLoading ? "Sedang Menganalisis" : (hasilLaporAnalisis ? "Buka Hasil Analisis" : "Mulai Analisis Sentimen")

    const statusClass = statusStyles[laporan.status] || statusStyles.default;

    return(
        <div className="h-full w-full flex flex-col lg:grid lg:grid-cols-5 gap-5">
            <StatusModel handleStatus={handleStatus}/>
            <div className="flex flex-col col-span-3 bg-white h-full w-full rounded-2xl border-2 p-5 gap-10 shadow-xl">
                <img src={laporan.fileURL} alt="image masalah" className="aspect-video h-1/2 w-auto object-contain bg-black rounded-2xl"/>
                <div className="flex sm:flex-row flex-col gap-5 w-full items-center justify-evenly">
                    <div className="flex flex-row gap-2 text-sm">
                        <p className={`${statusClass} w-fit rounded-full p-1 px-2`}>{laporan.status}</p>
                        <p className="bg-gray-300 w-fit rounded-full p-1 px-2">{laporan.kategori}</p>
                    </div>
                    <div className="flex flex-row text-primary gap-2">
                        <MapPin />
                        <p>{laporan.alamat}</p>
                    </div>
                    <div className="flex flex-row gap-2 text-primary">
                        <User />
                        <div className="flex flex-row gap-2">
                            <p>{laporan.pendukung}</p>
                            <p className="text-black">Pendukung</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-between h-full p-3 gap-5">
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-bold">{laporan.judul}</h1>
                        <p className="text-gray-400">{laporan.deskripsi}</p>
                    </div>
                    {isAdmin ? 
                        <div className="flex flex-col w-full gap-2">
                            <button onClick={() => {analisisLoading ? "" : (hasilLaporAnalisis ? setShowAnalisis(true) : analisisLaporan(laporan))}} className="w-full bg-neutral-100 p-2 rounded-full text-primary hover:bg-neutral-300 border-2 border-primary duration-150">{textAnalisisButton}</button>
                            <button onClick={() => setShowStatus(true)} className="w-full bg-primary p-2 rounded-full text-white hover:bg-secondary duration-150">Tindak Lanjuti</button>
                        </div>
                        :
                        <button onClick={() => upVote()} className="w-full bg-primary p-2 rounded-full text-white hover:bg-secondary duration-150">Berikan suara untuk laporan ini</button>
                    }
                </div>
            </div>

            
            
            {/* bagian diskusi */}
            <div className="lg:col-span-2 bg-white py-3 px-2 md:p-8 rounded-2xl shadow-lg space-y-6">
                {hasilLaporAnalisis && showAnalisis ?
                    <div className="flex flex-col p-5 gap-10">
                        <h1 className="text-3xl font-bold">Hasil Analisis Sentimen</h1>
                        <p className="text-justify">{hasilLaporAnalisis}</p>
                        <button onClick={() => setShowAnalisis(false)} className="bg-secondary hover:bg-primary rounded-full p-2 px-4 text-white duration-150">Tutup Analisis</button>
                    </div>
                :
                    <>
                    <div className="pt-4 px-5 md:pt-0 md:px-0 space-y-4">
                        {/* Bagian Judul */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-slate-900">
                                Ruang Aspirasi Warga
                            </h2>
                                    
                            <p className="text-slate-500 text-xs">
                                Bagikan pendapat Anda, baca pandangan warga lain, dan ikut berdiskusi dengan sehat.
                            </p>
                        </div>
                                
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input 
                                type="text" 
                                placeholder="Pilih topik laporan terkini" 
                                className="
                                    w-full px-4 py-1 md:py-2 bg-slate-50 border border-red-800 text-slate-800
                                    placeholder-slate-400 rounded-full
                                    focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent
                                    transition duration-300 ease-in-out
                                "
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <button 
                                type="button"
                                disabled={!currentUser}
                                onClick={() => setIsDiscussion(true)}
                                aria-label="Kirim Aspirasi"
                                className="
                                    flex items-center justify-center gap-2 w-full sm:w-auto text-xs flex-shrink-0
                                    px-4 py-2 rounded-full bg-primary text-white font-semibold shadow-md
                                    hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                                    transition-all duration-300 ease-in-out transform hover:scale-105
                                    disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                                "
                            >
                                <span>Berikan Aspirasi</span>
                            </button>
                        </div>
                    </div>
                    </>
                }
            

            <hr className="h-1"/>
                        
            {/* Bagian untuk menampilkan form diskusi (Modal/Component) */}
            {laporan && isDiscussion && (
                <DiscussionForm
                    isOpen={isDiscussion}
                    onClose={() => setIsDiscussion(false)}
                    sourceId={laporan.id}
                    sourceCollection="laporan"
                    additionalData={{ 
                        sourceType: "laporan", 
                        kategori: laporan.kategori
                    }}
                    onDiscussionAdded={triggerRefresh}  
                />
            )}
            
            <div className="space-y-4  border-slate-200/80">
                <PolicyDiscussionList 
                    sourceId={laporan.id}
                    searchTerm={searchTerm}
                    refreshKey={refreshKey}
                />
            </div>
        </div>
    </div>
)
}