import { useEffect, useState } from "react";
import { useLapor } from "../hooks/useLapor"
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import LaporCard from "./laporCard";
import LaporList from "./subComponent/laporList";

export default function Content(){
    return(
        <>
            <LaporList kategori={"Terpopuler"}/>
            <LaporList kategori={"Terbaru"}/>
            <LaporList kategori={"Laporan Anda"}/>
        </>
    )
}