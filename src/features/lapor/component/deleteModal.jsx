import { useLapor } from "../hooks/useLapor"

export default function DeleteModal(){
    const { showDelete, setShowDelete, handleDelete } = useLapor()

    if (!showDelete) return null

    return(
        <div className="h-screen w-full z-40 fixed inset-0">
            <div onClick={() => setShowDelete(false)} className="h-full w-full absolute bg-black opacity-50 z-10 backdrop-blur-sm"></div>
            <div className="h-full w-full flex items-center justify-center">
                <div className="h-fit w-fit bg-white rounded-2xl flex flex-col items-center justify-evenly p-10 z-20 gap-10">
                    <h1 className="text-2xl font-semibold">Apakah anda yakin ingin menghapus laporan ini?</h1>
                    <button onClick={() => handleDelete()} className="bg-red-800 text-white rounded-2xl p-2 px-5">Delete</button>
                </div>
            </div>
        </div>
    )
}