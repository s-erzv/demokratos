import { MapPin, Pencil, Trash, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/AuthContext";
import { useLapor } from "../hooks/useLapor";

const statusStyles = {
  "Baru diajukan": "bg-yellow-100 text-yellow-800",
  "Dalam Verifikasi": "bg-yellow-100 text-yellow-800",
  "Dalam Pengerjaan": "bg-blue-100 text-blue-800",
  "Selesai": "bg-green-100 text-green-800",
  "Ditolak": "bg-red-100 text-red-800",
  "default": "bg-gray-100 text-gray-800" 
};

export default function LaporCard({imageURL, judul, deskripsi, alamat, kategori, status, pendukung, id, authorId }){
    const navigate = useNavigate()
    const { userData } = useAuth()
    const { setShowDelete, setSelectDelete, setShowUpdate, setSelectUpdate, setDataUpdate } = useLapor()

    const setting = authorId === userData.uid

    const statusClass = statusStyles[status] || statusStyles.default;

    return(
        <div className="h-fit w-full bg-white border-2 rounded-2xl p-2 flex flex-col gap-3 shadow-md relative max-w-80 justify-self-center">
            <div className={`${setting ? "" : "hidden"} flex flex-row absolute top-0 right-0 p-5 gap-3`} >
                <button onClick={() => {setShowUpdate(true), setSelectUpdate(id), setDataUpdate({ judul, deskripsi, alamat})}} className="bg-primary rounded-full aspect-square p-1 text-white hover:bg-secondary duration-150"><Pencil size={20}/></button>
                <button onClick={() => {setShowDelete(true), setSelectDelete(id)}} className="bg-primary rounded-full aspect-square p-1 text-white hover:bg-secondary duration-150"><Trash size={20}/></button>
            </div>
            <img src={imageURL} alt={`${judul} image`} className="h-40 w-full rounded-2xl object-cover"/>
            <div className="flex flex-col px-2 gap-3 justify-between">
                <div className="flex flex-row gap-2 text-[10px] ">
                    <p className={`${statusClass} w-fit rounded-full p-1 px-2`}>{status}</p>
                    <p className="bg-gray-300 w-fit rounded-full p-1 px-2">{kategori}</p>
                </div>
                <div className="flex flex-col">
                    <h2 className="text-2xl font-semibold truncate">{judul}</h2>
                    <p className="text-gray-400 truncate">{deskripsi}</p>
                </div>
                <div className="flex flex-row text-primary gap-2 text-sm">
                    <MapPin />
                    <p>{alamat}</p>
                </div>
                <div className="flex flex-row items-center justify-between gap-5">
                    <div className="flex flex-row gap-2 text-sm">
                        <User className="text-primary"/>
                        <div className="flex flex-row gap-1 items-center">
                            <p className="text-primary">{pendukung}</p>
                            <p> Pendukung laporan</p>
                        </div>
                    </div>
                    <button onClick={() => navigate(`/laporan/${id}`)} className="flex self-center bg-primary hover:bg-secondary duration-150 rounded-full text-white p-1 px-2 text-sm">Detail</button>
                </div>
            </div>
        </div>
    )
}