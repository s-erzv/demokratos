import { ChevronDown, Search } from "lucide-react";
import { useLapor } from "../hooks/useLapor";
import FilterList from "./subComponent/filterList";
import { useState } from "react";
import SortList from "./subComponent/sortList";

export default function Header({sort}){
    const { setShow, isAdmin, setSearch, search} = useLapor()

    const [showFilter, setShowFilter] = useState(false)
    const [showSort, setShowSort] = useState(false)

    return(
        <header className="bg-white rounded-xl shadow-lg p-6 md:px-10 md:py-20 relative mb-10">
            <div className="absolute top-0 right-0 h-full w-[50%] z-0">
                <div 
                    className="w-full h-full bg-center bg-cover bg-no-repeat max-xl:hidden bg-[url('/lapor/indonesiaMap.svg')]" 
                >          
                </div>
            </div>

            <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                    Sampaikan Laporan Anda
                </h1>
                <p className="text-lg text-gray-600 mt-2 pr-5">
                    Setiap laporan akan ditindaklanjuti demi layanan publik yang lebih baik.
                </p>

                <div className="mt-6 flex flex-col md:flex-row gap-4 max-w-xl">
                    <div className="relative flex-1 h-fit">
                        <input
                            type="text"
                            placeholder="Telusuri daftar laporan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-gray-300 rounded-full py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition duration-150"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    </div>
                    <div className="md:flex md:flex-row gap-4 grid grid-cols-2">
                        <div className="flex flex-col relative">
                            <button onClick={() => setShowFilter(prev => !prev)} className="bg-secondary text-white border border-white font-semibold py-2 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-red-800 transition-colors">
                                Filter
                                <ChevronDown />
                            </button>
                            <FilterList seeMore={showFilter} setSeeMore={setShowFilter}/>
                        </div>
                        <div className={`${sort ? "" : "hidden"} flex flex-col relative`}>
                            <button onClick={() => setShowSort(prev => !prev)} className="bg-secondary text-white border border-white font-semibold py-2 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-red-800 transition-colors">
                                Sort
                                <ChevronDown />
                            </button>
                            <SortList seeMore={showSort} setSeeMore={setShowSort}/>
                        </div>
                        <button onClick={() => setShow(true)} className={`${isAdmin ? "hidden" : ""} bg-primary text-white border border-white font-semibold py-2 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-red-800 transition-colors h-fit max-md:col-span-2`}>
                            Lapor
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}