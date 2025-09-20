import { useLapor } from "../hooks/useLapor"

export default function Content(){
    const { dummy } = useLapor()

    return(
        <>
            <div>
                {dummy.map(item => (
                    <div key={item.id}>
                        {item.title}
                    </div>
                ))}
            </div>
        </>
    )
}