import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { doc, getDoc, increment, updateDoc, writeBatch } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { MapPin, User } from "lucide-react";
import { useAuth } from "../../hooks/AuthContext";
import { useLapor } from "./hooks/useLapor";
import StatusModel from "./component/statusModal";

export default function LaporDetail(){
    const { laporanId } = useParams()
    const { userData } = useAuth()
    const { isAdmin, setShowStatus, search } = useLapor()

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

    async function handleStatus(newStatus){
        try {
            const laporanRef = doc(db, "laporan", laporanId);

            await updateDoc(laporanRef, {
                status: newStatus
            });

            console.log(`Successfully updated status for ${laporanId} to ${newStatus}`);
        } catch (error) {
            console.error("Error updating document status: ", error);
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return(
        <div className="h-full w-full grid grid-cols-5 gap-5">
            <StatusModel handleStatus={handleStatus}/>
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
                            <button onClick={() => console.log("analisis")} className="w-full bg-neutral-100 p-2 rounded-full text-primary hover:bg-neutral-300 border-2 border-primary duration-150">Mulai Analisis Sentimen</button>
                            <button onClick={() => setShowStatus(true)} className="w-full bg-primary p-2 rounded-full text-white hover:bg-secondary duration-150">Tindak Lanjuti</button>
                        </div>
                        :
                        <button onClick={() => upVote()} className="w-full bg-primary p-2 rounded-full text-white hover:bg-secondary duration-150">Berikan suara untuk laporan ini</button>
                    }
                </div>
            </div>
            <div className="bg-white rounded-2xl h-full w-full border-2 shadow-2xl p-5 col-span-2 gap-3 flex flex-col">
                <div className="flex flex-col p-2">
                    <h2 className="text-2xl font-semibold">Ruang Aspirasi Warga</h2>
                    <p className="text-gray-400 text-sm">Bagikan pendapat Anda, baca pandangan warga lain, dan ikut berdiskusi dengan sehat.</p>
                </div>
                <div className="flex flex-row w-full justify-between">
                    <input type="text" placeholder="Cari Aspirasi..." className="border-2 w-2/3 rounded-full p-2 px-3 focus:border-primary"/>
                    <button className="w-fit bg-primary text-white rounded-full hover:bg-secondary p-2 px-3">Berikan Aspirasi</button>
                </div>
                <div>
                    chat nanti
                </div>
            </div>
        </div>
    )
}