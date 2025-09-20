import { createContext, useContext, useState } from "react";

const LaporContext = createContext()

export const LaporProvider = ({ children }) => {

    const [show, setShow] = useState(false)

    const dummy = [
        {
            id: 1,
            title: "Laporan 1",
            description: "Deskripsi laporan 1",
            status: "pending"
        },
        {
            id: 2,
            title: "Laporan 2",
            description: "Deskripsi laporan 2",
            status: "approved"
        }
    ]

    return(
        <LaporContext.Provider value={{ dummy, show, setShow }}>
            {children}
        </LaporContext.Provider>
    )
}

export const useLapor = () => useContext(LaporContext)