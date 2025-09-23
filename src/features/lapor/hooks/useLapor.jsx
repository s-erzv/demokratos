import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, storage } from "../../../firebase";
import { addDoc, collection, doc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useAuth } from "../../../hooks/AuthContext";

const LaporContext = createContext()

export const LaporProvider = ({ children }) => {

    const { userData } = useAuth()

    const isAdmin = userData?.role === "admin"

    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("")

    const [showStatus, setShowStatus] = useState(false)

    const [show, setShow] = useState(false)
    const [kategori, setKategori] = useState("")
    const [file, setFile] = useState("")
    const [judul, setJudul] = useState("")
    const [deskripsi, setDeskripsi] = useState("")
    const [alamat, setAlamat] = useState("")

    const user = auth.currentUser

    async function handleSubmit() {
        const timeStamp = Date.now()

        if (!file) return;

        console.log("file uploaded: ", file)

        if (file && kategori && judul && deskripsi) {
            try {
                const imageRef = ref(storage, `lapor/${user.uid}/${timeStamp}`)
                await uploadBytes(imageRef, file)

                const photoURL = await getDownloadURL(imageRef)

                const newLaporanRef = doc(collection(db, "laporan"));
                
                const laporanData = {
                    judul: judul,
                    deskripsi: deskripsi,
                    kategori: kategori,
                    fileURL: photoURL,
                    alamat: alamat,
                    status: "Baru diajukan",
                    pendukung: 0,
                    authorId: user.uid,
                    discussionCount: 0,
                    docId: newLaporanRef.id,
                    createdAt: serverTimestamp() 
                };

                await setDoc(newLaporanRef, laporanData);

                console.log("Laporan berhasil dibuat")
                setShow(false)
                resetForm()
            } catch (error) {
                console.error(error);
            }
        } else {
            console.log("harus isi semua")
        }
    }

    function resetForm(){
        setKategori("")
        setFile("")
        setJudul("")
        setDeskripsi("")
        setAlamat("")
    }

    return(
        <LaporContext.Provider value={{ show, setShow, search, setSearch, filter, setFilter, handleSubmit, resetForm, judul, setJudul, deskripsi, setDeskripsi, alamat, setAlamat, setKategori, setFile, isAdmin, showStatus, setShowStatus }}>
            {children}
        </LaporContext.Provider>
    )
}

export const useLapor = () => useContext(LaporContext)