export default function Header({intro, title, desc}){
    return(
        <div className='flex flex-col md:items-center justify-center md:text-center gap-2 animate-slideDown [animation-timeline:view()]'>
            <p className='py-1 px-4 sm:py-2 sm:px-5 rounded-full md:text-base sm:text-sm text-xs border-2 border-neutral-400/50 bg-white text-primary w-fit flex md:self-center'>{intro}</p>
            <h2 className='lg:text-5xl text-3xl font-semibold text-primary'>{title}</h2>
            <p className='lg:text-xl text-sm opacity-50'>
                {desc}
            </p>
        </div>
    )
}