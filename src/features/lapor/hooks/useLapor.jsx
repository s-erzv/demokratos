import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, storage } from "../../../firebase";
import { addDoc, collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const LaporContext = createContext()

export const LaporProvider = ({ children }) => {

    const [data, setData] = useState([])

    useEffect(() => {
        fetchLaporan()
    },[])

    async function fetchLaporan() {
        try {
            const querySnapshot = await getDocs(collection(db, "laporan"));
            const laporans = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setData(laporans)
        } catch (error) {
            console.error(error)
        }
    }

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

                const docRef = await addDoc(collection(db, "laporan"), {
                    judul: judul,
                    deskripsi: deskripsi,
                    kategori: kategori,
                    fileURL: photoURL,
                    alamat: alamat,
                    status: "Baru diajukan",
                    pendukung: 0,
                    authorId: user.uid
                })

                await updateDoc(docRef, {
                    docId: docRef.id
                });

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
        <LaporContext.Provider value={{ show, setShow, handleSubmit, resetForm, judul, setJudul, deskripsi, setDeskripsi, alamat, setAlamat, setKategori, setFile, data }}>
            {children}
        </LaporContext.Provider>
    )
}

export const useLapor = () => useContext(LaporContext)