import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import LaporCard from "../laporCard";

export default function LaporList({kategori}){
    const [data, setData] = useState([])
    
    useEffect(() => {
        fetchLaporan()
    },[])

    async function fetchLaporan() {
        try {
            const querySnapshot = await getDocs(collection(db, "laporan"));
            const laporans = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setData(laporans)
        } catch (error) {
            console.error(error)
        }
    }

    return(
        <>
            <h1 className="p-5 text-3xl font-bold border-b-2">{kategori}</h1>
            <div className="flex flex-row overflow-x-auto w-full gap-5 h-3/5 p-2 mb-5">
                {data.map(laporan => (
                    <div key={laporan.id} className="flex-shrink-0">
                        <LaporCard imageURL={laporan.fileURL} judul={laporan.judul} deskripsi={laporan.deskripsi} alamat={laporan.alamat} kategori={laporan.kategori} status={laporan.status} pendukung={laporan.pendukung} id={laporan.docId}/>
                    </div>
                ))}
            </div>
        </>
    )
}