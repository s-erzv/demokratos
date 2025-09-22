import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import LaporCard from "../laporCard";
import { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import { useAuth } from "../../../../hooks/AuthContext";
import { useLapor } from "../../hooks/useLapor";

export default function LaporList({kategori}){
    const { isAdmin, search, filter } = useLapor()
    const { userData } = useAuth()

    const [data, setData] = useState([])
    const [filteredData, setFilteredData] = useState([])

    if (isAdmin && kategori === "Laporan Anda") return null

    async function fetchLaporan() {
        try {
            const laporanRef = collection(db, "laporan");
            let q = query(laporanRef);

            if (kategori === 'Terpopuler') {
                q = query(q, orderBy("pendukung", "desc")); // 'desc' = descending (terbanyak ke terkecil)
            }
            if (kategori === 'Terbaru') {
                q = query(q, orderBy("createdAt", "desc")); // 'desc' = descending (terbaru ke terlama)
            }
            if (kategori === 'Laporan Anda') {
                q = query(laporanRef, where("authorId", "==", userData.uid));
            }

            const querySnapshot = await getDocs(q);
            const laporanData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setData(laporanData);
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchLaporan()
    }, [])

    useEffect(() => {
        let result = data

        if (search) {
            result = result.filter(laporan => 
                laporan.judul.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        if (filter) {
            result = result.filter(laporan =>
                laporan.kategori === filter
            );
        }
     
        setFilteredData(result);
    }, [search, data, filter]);

    return(
        <>
            <h1 className="p-5 text-3xl font-bold border-b-2">{kategori}</h1>
            <div className="flex flex-row overflow-x-auto w-full gap-5 h-3/5 p-2 mb-5">
                {filteredData.map(laporan => (
                    <div key={laporan.id} className="flex-shrink-0">
                        <LaporCard imageURL={laporan.fileURL} judul={laporan.judul} deskripsi={laporan.deskripsi} alamat={laporan.alamat} kategori={laporan.kategori} status={laporan.status} pendukung={laporan.pendukung} id={laporan.docId}/>
                    </div>
                ))}
            </div>
        </>
    )
}