import React from 'react'


const Footer = () => {
  return (
    <div className='w-full flex flex-col  md:pt-10 px-0 pt-10 pb-2 bg-card rounded-2xl items-center justify-center md:gap-15 gap-8'>
        <div className='w-full flex flex-row lg:px-15 px-5 sm:px-9 md:px-12 items-center justify-between max-md:gap-5'>
            <div className='w-full flex flex-col items-start gap-3'>
                
                    <img src="/logo light.svg" 
                    alt="Planix Logo"
                    className='size-15 2xl:size-20 block' />

                    <h2 className='text-xl md:text-5xl mt-2  font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>Planix</h2>
            
                <p className='text-xs lg:text-2xl md:text-lg text-left font-medium text-text'>Smarter planning, powered by people & data</p>
            </div>

            <div className='w-full flex flex-row gap-3 sm:gap-5 md:gap-15 lg:gap-20 sm:justify-end justify-center'>
                <div className='flex flex-col justify-start sm:gap-2 md:gap-3 gap-1 text-text'>
                    <h3 className='md:text-xl sm:text-lg text-base font-semibold '>Product</h3>
                    <a href='/welcome#features' 
                    className='hover:text-hover-button duration-150 text-small-font sm:text-xs md:text-base'>Features</a>
                    <a href='/welcome#demo' 
                    className='hover:text-hover-button duration-150 text-small-font sm:text-xs md:text-base'>Demo</a>
                    <a href='/welcome#flow' 
                    className='hover:text-hover-button duration-150 text-small-font sm:text-xs md:text-base'>How it Works</a>
                </div>
                <div className='flex flex-col gap-2 text-text'>
                    <h3 className='md:text-xl sm:text-lg text-base font-semibold '>Team</h3>
                    <a href='/welcome#team' 
                    className='hover:text-hover-button duration-150 text-small-font sm:text-xs md:text-base'>Our Team</a>
                </div>
            </div>
        </div>

        <div className='w-full space-y-2 pb-1'>
            <div className='w-full md:h-1 h-0.5 bg-footer'></div>
            <p className='text-center md:text-lg sm:text-xs text-[10px] text-text'>© 2025 Shadow Army. All rights reserved.</p>
        </div>
    </div>
  )
}

export default Footer