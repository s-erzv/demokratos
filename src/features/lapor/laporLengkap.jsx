import Content from "./component/content";
import ContentLengkap from "./component/contentLengkap";
import Header from "./component/header";
import LaporModel from "./component/laporModel";

export default function LaporLengkap(){
    return(
        <>
            <Header/>
            <ContentLengkap/>
            <LaporModel/>
        </>
    )
}