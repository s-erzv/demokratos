import LaporInput from "./subComponent/LaporInput";

import { useLapor } from "../hooks/useLapor";

export default function LaporModel(){
    const { show, setShow, handleSubmit, resetForm, judul, setJudul, deskripsi, setDeskripsi, alamat, setAlamat, setKategori, setFile } = useLapor()

    if (!show) return null

    return(
        <div  className="h-screen w-full z-40 fixed inset-0">
            <div onClick={() => {setShow(false), resetForm()}} className="h-full w-full absolute bg-black opacity-50 z-10 backdrop-blur-sm"></div>
            <div className="h-full w-full flex items-center justify-center px-80 py-10">
                <div className="h-full w-full bg-white rounded-2xl flex flex-col items-center justify-evenly p-10 z-20">
                    <div className="w-full flex flex-col gap-1 items-center">
                        <h1 className="text-3xl font-bold">Buat Laporan</h1>
                        <p className="text-lg text-gray-500 font-thin">Laporkan masalah infrastruktur atau layanan publik agar segera ditindaklanjuti.</p>
                    </div>
                    <div className="flex flex-row items-center justify-between w-full">
                        <div className="flex flex-row items-center justify-center gap-3">
                            Kategori
                            <select className="bg-gray-300 rounded-2xl p-3" onChange={(e) => setKategori(e.target.value)}>
                                <option value={""} disabled selected>Pilih</option>
                                <option value={"Infrastruktur"}>Infrastruktur</option>
                                <option value={"Kesehatan"}>Kesehatan</option>
                                <option value={"Pendidikan"}>Pendidikan</option>
                                <option value={"Lainnya"}>Lainnya</option>
                            </select>
                        </div>
                        <div className="flex flex-row items-center justify-center w-1/3">
                            <p className="w-full">Uploaded File</p>
                            <label className={`w-full p-2 rounded-2xl bg-gray-300`}>
                                <p className='xl:text-lg lg:text-base md:text-sm text-xs text-center'>Pilih File</p>
                                <input
                                    type='file'
                                    accept='.jpg, .jpeg, .png'
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className={`
                                    hidden
                                    `}
                                />
                            </label>
                        </div>
                    </div>
                    <LaporInput title={"Judul laporan"} placeholder={"Contoh: “Jalan berlubang di Jl. Sudirman”"} value={judul} onchange={(e) => setJudul(e.target.value)}/>
                    <LaporInput title={"Deskripsi Masalah"} placeholder={"Ceritakan detail masalah yang Anda temui…"} value={deskripsi} onchange={(e) => setDeskripsi(e.target.value)}/>
                    <LaporInput title={"Lokasi Masalah"} placeholder={"Tuliskan alamat lengkap lokasi masalah"} value={alamat} onchange={(e) => setAlamat(e.target.value)}/>
                    <button onClick={() => handleSubmit()} className="w-full bg-primary rounded-full text-white p-2">Kirim Laporan</button>
                </div>
            </div>
        </div>
    )
}