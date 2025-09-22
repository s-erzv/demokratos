export default function LaporInput({title, placeholder, value, onchange}){
    return(
        <div className="w-full flex flex-col gap-2">
            <p className="text-xl">{title}</p>
            <input type="text" placeholder={placeholder} value={value} onChange={onchange} className="bg-gray-100 border-2 p-3 rounded-full h-full"/>
        </div>
    )
}