import { MapPin, User } from "lucide-react";
import { redirect, useNavigate } from "react-router-dom";

export default function LaporCard({imageURL, judul, deskripsi, alamat, kategori, status, pendukung, id}){
    const navigate = useNavigate()

    return(
        <div className="h-fit w-full bg-white border-2 rounded-2xl p-2 flex flex-col gap-3 shadow-md">
            <img src={imageURL} alt={`${judul} image`} className="h-40 w-full rounded-2xl object-cover"/>
            <div className="flex flex-col px-2 gap-3 justify-between">
                <div className="flex flex-row gap-2 text-[10px] ">
                    <p className="bg-gray-300 w-fit rounded-full p-1 px-2">{status}</p>
                    <p className="bg-gray-300 w-fit rounded-full p-1 px-2">{kategori}</p>
                </div>
                <div className="flex flex-col">
                    <h2 className="text-2xl font-semibold">{judul}</h2>
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
                            <p> orang mendukung laporan ini</p>
                        </div>
                    </div>
                    <button onClick={() => navigate(`/laporan/${id}`)} className="flex self-center bg-primary hover:bg-secondary duration-150 rounded-full text-white p-1 px-2 text-sm">Detail</button>
                </div>
            </div>
        </div>
    )
}