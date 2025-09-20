import MainLayout from "../components/MainLayout";
import DiscussionFeed from "../features/discussion/DiscussionFeed"

const discussion = () => {
    return(
        <MainLayout>
            {/* <h1>HALO, INI HALAMAN DISKUSI!</h1> */}
            <DiscussionFeed /> 
        </MainLayout>
    )
}

export default discussion;