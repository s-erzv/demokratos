import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { doc, getDoc, increment, updateDoc, writeBatch } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { MapPin, User } from "lucide-react";
import { useAuth } from "../../hooks/AuthContext";
import PolicyDiscussionList from "../discussion/PolicyDiscussionList";
import DiscussionForm from "../discussion/DiscussionForm";

export default function LaporDetail(){
    const [isDiscussion, setIsDiscussion] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [posts, setPosts] = useState([]);
    const [policy, setPolicy] = useState(null);
    const { currentUser } = useAuth();
    const { laporanId } = useParams()
    const { userData } = useAuth()


    const [laporan, setLaporan] = useState([])

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
            
            console.log("Upvote berhasil!");

        } catch (error) {
            console.error("Gagal memberikan upvote: ", error);
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

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
    }, [laporanId]);

    if (loading) return <p>Memuat laporan...</p>;
    if (!laporan) return <p>Laporan tidak ditemukan.</p>;

    return(
        <div className="h-full w-full grid grid-cols-5 gap-5">
            <div className="flex flex-col col-span-3 bg-white h-full w-full rounded-2xl border-2 p-5 gap-10 shadow-xl">
                <img src={laporan.fileURL} alt="image masalah" className="aspect-video h-1/2 w-auto object-contain bg-black rounded-2xl"/>
                <div className="flex flex-row w-full items-center justify-evenly">
                    <div className="flex flex-row gap-2 text-sm">
                        <p className="bg-gray-300 w-fit rounded-full p-1 px-2">{laporan.status}</p>
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
                            <p className="text-black">orang mendukung laporan ini</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-between h-full p-3 gap-5">
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-bold">{laporan.judul}</h1>
                        <p className="text-gray-400">{laporan.deskripsi}</p>
                    </div>
                    <button onClick={() => upVote()} className="w-full bg-primary p-2 rounded-full text-white hover:bg-secondary duration-150">Berikan suara untuk laporan ini</button>
                </div>
            </div>

            {/* bagian diskusi */}
            <div className="lg:col-span-2 bg-white py-3 px-2 md:p-8 rounded-2xl shadow-lg space-y-6">

                        {/* Bagian Judul */}
                        <div className="space-y-2">
                            {/* Judul 
                            - Ukuran teks dibuat lebih besar dan responsif (text-2xl -> md:text-3xl).
                            - Warna diubah menjadi lebih gelap dan modern (text-slate-900).
                            - border-b dihilangkan, diganti dengan pemisah di bawah nanti untuk look yang lebih clean.
                            */}
                            <h2 className="text-xl  font-bold text-slate-900">
                            Ruang Aspirasi Warga
                            </h2>
                            {/* Deskripsi
                            - Warna teks dibuat lebih lembut (text-slate-500) untuk menciptakan hierarki visual.
                            */}
                            <p className="text-slate-500 text-xs">
                            Bagikan pendapat Anda, baca pandangan warga lain, dan ikut berdiskusi dengan sehat.
                            </p>
                        </div>
                        
                        {/* Form Input & Tombol
                            - Menggunakan 'flex-col' di layar kecil, dan 'sm:flex-row' di layar lebih besar.
                            - 'gap-3' memberikan jarak yang konsisten baik vertikal maupun horizontal.
                        */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input 
                            type="text" 
                            placeholder="Pilih topik laporan terkini" 
                            className="
                                w-full px-4 py-2 bg-slate-50 border border-red-800 text-slate-800
                                placeholder-slate-400 rounded-full
                                focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent
                                transition duration-300 ease-in-out
                            "
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <button 
                            type="submit"
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
                            {/* Jika Anda punya icon, letakkan di sini. Akan terlihat bagus! */}
                            {/* <Send size={20} /> */}
                            <span>Berikan Aspirasi</span>
                            </button>
                        </div>
                        
                        {/* Bagian untuk menampilkan form diskusi (Modal/Component) */}
                        {laporan && isDiscussion && (
                            <DiscussionForm
                                isOpen={isDiscussion}
                                onClose={() => setIsDiscussion(false)}
                                sourceType="laporan"
                                sourceId={laporan.id}
                                additionalData={{ kategori: laporan.kategori }}
                                onDiscussionAdded={fetchLaporan} 
                            />
                        )}
                        
                        {/* Daftar Diskusi
                            - 'pt-6' memberikan jarak atas yang lebih besar.
                            - 'border-t' menambahkan garis pemisah yang halus dan modern.
                        */}
                        <div className="space-y-4 pt-6 border-slate-200/80">
                            <PolicyDiscussionList 
                            sourceId={laporan.id}
                            />
                        </div>
                    </div>
        </div>
    )
}