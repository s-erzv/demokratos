import { useLapor } from "../hooks/useLapor"

export default function StatusModel({ handleStatus }){
    const { setShowStatus, showStatus } = useLapor()

    const status = [
        {
            nama: "Dalam Verifikasi",
            warna: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
        }, 
        {
            nama: "Dalam Pengerjaan",
            warna: "bg-blue-100 text-blue-800 hover:bg-blue-200"
        }, 
        {
            nama: "Selesai",
            warna: "bg-green-100 text-green-800 hover:bg-green-200"
        }, 
        {
            nama: "Ditolak",
            warna: "bg-red-100 text-red-800 hover:bg-red-200"
        }
    ]

    if (!showStatus) return null

    return(
        <div className="h-screen w-full z-40 fixed inset-0">
            <div onClick={() => setShowStatus(false)} className="h-full w-full absolute bg-black opacity-50 z-10 backdrop-blur-sm"></div>
            <div className="h-full w-full flex items-center justify-center">
                <div className="h-fit w-fit bg-white rounded-2xl flex flex-col items-center justify-evenly p-10 z-20 gap-10">
                    <h1 className="text-2xl font-semibold">Status</h1>
                    <div className="flex flex-row items-center gap-2 w-full">
                        {status.map((status) => (
                            <div onClick={() => {setShowStatus(false), handleStatus(status.nama)}} className={`${status.warna} rounded-full p-1 px-3 duration-150`}>{status.nama}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}