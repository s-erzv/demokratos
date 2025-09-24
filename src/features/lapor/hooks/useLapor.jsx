import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, LaporanModel, storage } from "../../../firebase";
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useAuth } from "../../../hooks/AuthContext";

const LaporContext = createContext()

export const LaporProvider = ({ children }) => {

    const { userData } = useAuth()

    const isAdmin = userData?.role === "admin"

    const [loading, setLoading] = useState(false)

    const [sort, setSort] = useState("")

    const [refreshLaporan, setRefreshLaporan] = useState(0)

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
                setRefreshLaporan(refreshLaporan + 1)
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

    const [currentDiskusi, setCurrentDiskusi] = useState([])
    const [hasilLaporAnalisis, setHasillaporAnalisis] = useState("")
    const [showAnalisis, setShowAnalisis] = useState(false)

    async function fetchDiskusi(LaporanId){
        const q = query(collection(db, "posts"), where("sourceId", "==", LaporanId))
        const querySnapshot = await getDocs(q)
        const diskusiData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))
        console.log(diskusiData)
        setCurrentDiskusi(diskusiData)
    }

    async function analisisLaporan(){
        const data = JSON.stringify(currentDiskusi)

        const prompt = `Coba berikan analisis berdasarkan data diskusi berikut ini: ${data}`

        const result = await LaporanModel.generateContent(prompt)

        const response = result.response
        const text = response.text()
        setHasillaporAnalisis(text)
        setShowAnalisis(true)
    }

    return(
        <LaporContext.Provider value={{ show, loading, setLoading, sort, setSort, showAnalisis, refreshLaporan, setShowAnalisis, setShow, fetchDiskusi, analisisLaporan, hasilLaporAnalisis, search, setSearch, filter, setFilter, handleSubmit, resetForm, judul, setJudul, deskripsi, setDeskripsi, alamat, setAlamat, setKategori, setFile, file, isAdmin, showStatus, setShowStatus }}>
            {children}
        </LaporContext.Provider>
    )
}

export const useLapor = () => useContext(LaporContext)