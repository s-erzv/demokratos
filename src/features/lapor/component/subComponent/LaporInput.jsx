export default function LaporInput({title, placeholder, value, onchange}){

    if (title === "Deskripsi Masalah") return(
        <div className="w-full flex flex-col gap-2">
            <p className="md:text-xl">{title}</p>
            <textarea type="text" placeholder={placeholder} value={value} onChange={onchange} rows={5} className="bg-gray-100 border-2 p-3 rounded-2xl h-full resize-none"/>
        </div>
    )

    return(
        <div className="w-full flex flex-col gap-2">
            <p className="md:text-xl">{title}</p>
            <input type="text" placeholder={placeholder} value={value} onChange={onchange} className="bg-gray-100 border-2 p-3 rounded-full h-full"/>
        </div>
    )
}