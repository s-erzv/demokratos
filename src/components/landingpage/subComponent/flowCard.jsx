export default function FlowCard({ step, title, desc}){
    return(
        <div className='flex flex-col h-full gap-3 md:gap-5 md:px-15 bg-card p-10 rounded-2xl bg-white'>
            <p className='rounded-full border-2 md:p-2 p-1 lg:p-2.5 text-base md:text-lg lg:text-xl font-bold w-fit aspect-square text-center border-flow-text text-flow-text'>{step}</p>
            <h3 className='md:text-4xl text-2xl font-semibold text-flow-text'>{title}</h3>
            <p className='md:text-lg text-sm font-extralight text-text'>
                {desc}
            </p>
        </div>
    )
}