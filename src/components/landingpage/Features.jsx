import React from 'react'

const Features = () => {
  return (
    <div className='bg-white lg:h-screen h-full w-full flex flex-col items-center justify-center xl:p-40 sm:p-20 py-5 px-10 pt-15 2xl:px-45  gap-8' id='features'>
        <div className='flex flex-col md:items-center justify-center gap-2 animate-slideDown [animation-timeline:view()]'>
            <h2 className='sm:text-5xl text-3xl font-semibold md:text-center'>Discover Powerful Features</h2>
            <p className='md:text-2xl text-sm md:text-center'>
                Explore how our intelligent planning assistant helps you design better, 
                greener, and smarter regions — effortlessly.
            </p>
        </div>
        <div className='grid lg:grid-cols-3 items-center justify-evenly sm:gap-7 px-3  gap-5 animate-slideUp [animation-timeline:view()] '>
            <div className='h-full  flex flex-col gap-2 bg-gray-300 p-5 sm:px-10 justify-evenly rounded-xl'>
                <h3 className='md:text-2xl text-xl font-semibold'>Smart Terrain Analysis</h3>
                <p className='2xl:text-lg sm:text-sm text-xs font-extralight'>
                    Automatically analyze elevation, slope, and flood-prone areas to inform planning 
                    decisions with real-world topography.
                </p>
            </div>
            
            <div className='h-full flex flex-col gap-2 bg-gray-300 p-5 sm:px-10 rounded-xl justify-evenly'>
                <h3 className='md:text-2xl text-xl font-semibold'>AI-Driven Zoning Layouts</h3>
                <p className='2xl:text-lg sm:text-sm text-xs font-extralight'>
                    Receive layout recommendations based on accessibility, land suitability, and environmental 
                    considerations — all tailored to your region.
                </p>
            </div>

            <div className='h-full flex flex-col gap-2 bg-gray-300 p-5 sm:px-10 rounded-xl justify-evenly'>
                <h3 className='md:text-2xl text-xl font-semibold'>Smart Planning Chatbot</h3>
                <p className='2xl:text-lg sm:text-sm text-xs font-extralight'>
                    Ask questions like “Why is this zone industrial?” and get instant, explainable answers — no 
                    more guesswork in spatial decisions.
                </p>
            </div>
        </div>
    </div>
  )
}

export default Features