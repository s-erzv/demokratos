export default function FeatCard({icon, title, desc}){
    return(
        <div className='h-full flex flex-col gap-2 bg-neutral-100 p-10 sm:px-10 items-start rounded-xl border-2 border-gray-400/50'>
            <img src={icon} alt={title} className='aspect-square h-10 w-auto'/>
            <h3 className='md:text-2xl text-xl font-semibold text-primary '>{title}</h3>
            <p className='2xl:text-lg sm:text-sm text-xs font-extralight text-black/50'>
                {desc}
            </p>
        </div>
    )
}