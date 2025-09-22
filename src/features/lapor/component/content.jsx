import { useLapor } from "../hooks/useLapor"
import LaporList from "./subComponent/laporList";
import { CircleX } from "lucide-react";

export default function Content(){
    const { filter, setFilter } = useLapor()

    return(
        <>
            <div className={`${filter ? " " : "hidden"} flex flex-row p-2 gap-1  w-fit items-center`}>
                <p>Kategori: </p>
                <button onClick={() => setFilter("")} className="flex flex-row gap-2 items-center text-white bg-primary p-1 px-3">{filter}<CircleX size={20}/></button>
            </div>
            <LaporList kategori={"Terpopuler"}/>
            <LaporList kategori={"Terbaru"}/>
            <LaporList kategori={"Laporan Anda"}/>
        </>
    )
}