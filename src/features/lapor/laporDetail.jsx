import { useParams } from "react-router-dom"

export default function LaporDetail(){
    const { userId } = useParams()

    return(
        <div>
            {userId}
        </div>
    )
}