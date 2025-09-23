import { useLapor } from "../../hooks/useLapor"

export default function SortList({seeMore, setSeeMore}){
    const { setSort } = useLapor()

    return(
        <div
            className={`z-50 w-fit font-semibold text-white
            flex flex-col gap-2 sm:text-sm text-xs duration-200 rounded-2xl origin-top text-center absolute inset-x-0 inset-y-12
            ${seeMore ? "scale-100" : "scale-0"}`}
        >
            <button
            className=" bg-primary py-2 px-4 rounded-xl"
            onClick={() => { setSort("Terpopuler"), setSeeMore(false)}}
            >
                Terpopuler
            </button>
            <button
            className=" bg-primary py-2 px-4 rounded-xl"
            onClick={() => { setSort("Terbaru"), setSeeMore(false)}}
            >
                Terbaru
            </button>
            <button
            className="bg-primary py-2 px-4 rounded-xl"
            onClick={() => { setSort("Laporan Anda"), setSeeMore(false)}}
            >
                Laporan Anda
            </button>
        </div>
    )
}