import MainLayout from "../components/MainLayout";
import { LaporProvider } from "../features/lapor/hooks/useLapor";
import LaporDetail from "../features/lapor/laporDetail";

export default function LaporDetailPage(){
    return(
        <LaporProvider>
            <MainLayout>
                <LaporDetail/>
            </MainLayout>
        </LaporProvider>
    )
}