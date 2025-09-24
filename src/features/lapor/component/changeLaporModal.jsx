import { useState, useEffect } from 'react';
import { useLapor } from '../hooks/useLapor';
import LaporInput from './subComponent/LaporInput';
import { X } from 'lucide-react';

export default function ChangelaporModal() {
    // Ambil semua yang dibutuhkan dari context
    const { showUpdate, setShowUpdate, dataUpdate, handleUpdate, resetForm } = useLapor();

    // 1. Buat state LOKAL untuk form di dalam modal ini
    const [inputJudul, setInputJudul] = useState('');
    const [inputDeskripsi, setInputDeskripsi] = useState('');
    const [inputAlamat, setInputAlamat] = useState('');

    // 2. Gunakan useEffect untuk mengisi state lokal saat modal dibuka
    useEffect(() => {
        if (dataUpdate) {
            setInputJudul(dataUpdate.judul || '');
            setInputDeskripsi(dataUpdate.deskripsi || '');
            setInputAlamat(dataUpdate.alamat || '');
        }
    }, [dataUpdate]); // Jalankan setiap kali dataUpdate dari context berubah

    const onUpdateClick = () => {
        const newData = {
            judul: inputJudul,
            deskripsi: inputDeskripsi,
            alamat: inputAlamat,
        };
        handleUpdate(newData); // Panggil fungsi handleUpdate dari context
    };

    if (!showUpdate) return null;

    return (
        <div className="h-screen w-full z-20 fixed inset-0">
            <div onClick={() => {setShowUpdate(false), resetForm()}} className="h-full w-full absolute bg-black opacity-50 z-10"></div>
            <div className="h-full w-full flex items-center justify-center">
                <div className="h-fit w-fit gap-5 bg-white overflow-x-auto rounded-2xl flex flex-col items-center justify-evenly p-10 z-20">
                    <button onClick={() => {setShowUpdate(false), resetForm()}} className="flex self-end"><X /></button>
                    <div className="w-full flex flex-col gap-1 items-center">
                        <h1 className="md:text-3xl text-xl font-bold">Ubah Laporan</h1>
                        <p className="md:text-lg text-sm text-gray-500 font-thin max-md:text-center">Laporkan masalah infrastruktur atau layanan publik agar segera ditindaklanjuti.</p>
                    </div>
                    <LaporInput title={"Judul laporan"} value={inputJudul} onchange={(e) => setInputJudul(e.target.value)} />
                    <LaporInput title={"Deskripsi Masalah"} value={inputDeskripsi} onchange={(e) => setInputDeskripsi(e.target.value)} />
                    <LaporInput title={"Lokasi Masalah"} value={inputAlamat} onchange={(e) => setInputAlamat(e.target.value)} />
                    <button onClick={onUpdateClick} className="w-full bg-primary rounded-full text-white p-2">Update Laporan</button>
                </div>
            </div>
        </div>
    );
}