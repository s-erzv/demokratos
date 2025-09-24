import { useLapor } from "../../hooks/useLapor"

export default function FilterList({seeMore, setSeeMore}){
    const { setFilter } = useLapor()

    return(
        <div
            className={`h-fit z-50 w-fit font-semibold text-white max-md:bg-neutral-300 flex flex-col gap-2 sm:text-sm text-[11px] duration-200 rounded-2xl origin-top text-center absolute inset-x-0 p-1 inset-y-12 ${seeMore ? "scale-100" : "scale-0"}`}
        >
            <button
            className=" bg-primary py-2 px-4 rounded-xl"
            onClick={() => { setFilter("Infrastruktur"), setSeeMore(false)}}
            >
                Infrakstruktur
            </button>
            <button
            className=" bg-primary py-2 px-4 rounded-xl"
            onClick={() => { setFilter("Kesehatan"), setSeeMore(false)}}
            >
                Kesehatan
            </button>
            <button
            className="bg-primary py-2 px-4 rounded-xl"
            onClick={() => { setFilter("Pendidikan"), setSeeMore(false)}}
            >
                Pendidikan
            </button>
            <button
            className="bg-primary py-2 px-4 rounded-xl"
            onClick={() => { setFilter("Lainnya"), setSeeMore(false)}}
            >
                Lainnya
            </button>
        </div>
    )
}