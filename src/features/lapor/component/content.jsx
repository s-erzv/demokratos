import { useEffect, useState } from "react";
import { useLapor } from "../hooks/useLapor"
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import LaporCard from "./laporCard";

export default function Content(){
    const { dummy } = useLapor()

    const [data, setData] = useState([])

    useEffect(() => {
        fetchLaporan()
    })

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
            <div className="flex flex-row overflow-scroll">
                {data.map(laporan => (
                    <div key={laporan.id} className="flex-shrink-0">
                        <LaporCard imageURL={laporan.fileURL} judul={laporan.judul} deskripsi={laporan.deskripsi} alamat={laporan.alamat} kategori={laporan.kategori}/>
                    </div>
                ))}
            </div>
        </>
    )
}