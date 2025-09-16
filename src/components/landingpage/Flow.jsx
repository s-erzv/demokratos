import React from 'react'

const Flow = () => {
  return (
    <div className='lg:h-screen h-full w-full flex flex-col md:items-center items-start justify-center 2xl:p-40 xl:px-20 sm:p-20 lg:px-12 lg:py-40 px-10 py-10 pt-20 lg:gap-20 sm:gap-10 gap-5 shadow-2xl' id='flow'>
        <div className='flex flex-col md:items-center text-left items-start justify-center gap-5 animate-slideUp [animation-timeline:view()] text-text'>
            <h2 className='md:text-5xl text-3xl font-semibold'>How It Works</h2>
            <p className='md:text-2xl text-sm md:text-center font-medium'>Plan your region in 3 smart steps — no technical experience needed</p>
        </div>
        
        <div className='grid lg:grid-cols-3 items-center justify-evenly sm:gap-10 gap-5 animate-slideUp [animation-timeline:view()]'>
            <div className='flex flex-col justify-center h-full gap-3 md:gap-5 md:px-15 bg-card p-10 rounded-2xl'>
                <p className='rounded-full border-2 md:p-2 p-1 lg:p-2.5 text-base md:text-lg lg:text-xl font-bold w-fit aspect-square text-center border-flow-text text-flow-text'>1</p>
                <h3 className='md:text-4xl text-2xl font-semibold text-flow-text'>Choose Your Area</h3>
                <p className='md:text-lg text-sm font-extralight text-text'>
                    Type your location and set a radius. We’ll load the terrain data for you.
                </p>
            </div>
            <div className='flex flex-col justify-center h-full gap-3 md:gap-5 md:px-15 bg-card p-10 rounded-2xl'>
                <p className='rounded-full border-2 md:p-2 p-1 lg:p-2.5 text-base md:text-lg lg:text-xl font-bold w-fit aspect-square text-center border-flow-text text-flow-text'>2</p>
                <h3 className='md:text-4xl text-2xl font-semibold text-flow-text'>Generate Layout</h3>
                <p className='md:text-lg text-sm font-extralight text-text'>
                    Let our AI analyze and suggest zoning based on accessibility, land use, and environment.
                </p>
            </div>
            <div className='flex flex-col justify-center h-full gap-3 md:gap-5 md:px-15 bg-card p-10 rounded-2xl'>
                <p className='rounded-full border-2 md:p-2 p-1 lg:p-2.5 text-base md:text-lg lg:text-xl font-bold w-fit aspect-square text-center border-flow-text text-flow-text'>3</p>
                <h3 className='md:text-4xl text-2xl font-semibold text-flow-text'>Ask the Assistant</h3>
                <p className='md:text-lg text-sm font-extralight text-text'>
                    Ask questions, get instant answers, and tweak your plan with AI-guided suggestions.
                </p>
            </div>
        </div>
    </div>
  )
}

export default Flow