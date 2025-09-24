import MainLayout from "../components/MainLayout";
import { LaporProvider } from "../features/lapor/hooks/useLapor";
import LaporLengkap from "../features/lapor/laporLengkap";

export default function LaporLengkapPage(){
    return(
        <LaporProvider>
            <MainLayout>
                <LaporLengkap/>
            </MainLayout>
        </LaporProvider>
    )
}