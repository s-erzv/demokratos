import React from 'react'


const Footer = () => {
  return (
    <>
        {/* Kontainer utama dengan padding responsif */}
        <div className='w-full flex flex-col bg-white rounded-2xl p-6 md:p-10'>
            {/* Bagian atas: Logo dan Menu */}
            <div className='w-full flex flex-col md:flex-row md:justify-between items-center md:items-start gap-8 md:gap-4'>
                
                {/* Sisi Kiri: Branding */}
                <div className='flex flex-col items-center md:items-start text-center md:text-left gap-2'>
                    <img 
                        src="/logoDemokratos.svg" 
                        alt="Demokratos Logo"
                        className='h-16 w-16' // Ukuran logo yang konsisten
                    />
                    <h2 className='text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                        Demokratos
                    </h2>
                    <p className='text-sm md:text-base text-text'>
                        Partisipasi Mudah, Dampak Nyata
                    </p>
                </div>
                
                {/* Sisi Kanan: Menu Links */}
                <div className='flex flex-row gap-8 sm:gap-12 md:gap-16 text-center md:text-left'>
                    <div className='flex flex-col gap-3 text-text'>
                        <h3 className='text-base md:text-lg font-semibold'>Product</h3>
                        <a href='/welcome#features' className='hover:text-primary duration-150 text-sm md:text-base'>Features</a>
                        <a href='/welcome#demo' className='hover:text-primary duration-150 text-sm md:text-base'>Demo</a>
                        <a href='/welcome#flow' className='hover:text-primary duration-150 text-sm md:text-base'>How it Works</a>
                    </div>
                    <div className='flex flex-col gap-3 text-text'>
                        <h3 className='text-base md:text-lg font-semibold'>Team</h3>
                        <a href='/welcome#team' className='hover:text-primary duration-150 text-sm md:text-base'>Our Team</a>
                    </div>
                </div>

            </div>
            
            {/* Bagian Bawah: Copyright */}
            <div className='w-full mt-10 space-y-3'>
                <div className='w-full h-0.5 bg-gray-200'></div>
                <p className='text-center text-xs sm:text-sm text-text'>© 2025 Shadow Army. All rights reserved.</p>
            </div>

        </div>
    </>
  )
}

export default Footer