import Content from "./component/content";
import DeleteModal from "./component/deleteModal";
import Header from "./component/header";
import LaporModel from "./component/laporModel";
import { LaporProvider } from "./hooks/useLapor";

export default function Lapor(){
    return(
        <LaporProvider>
            <Header/>
            <Content/>
            <LaporModel/>
            <DeleteModal/>
        </LaporProvider>
    )
}