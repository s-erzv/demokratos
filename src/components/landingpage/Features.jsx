import React from 'react'

const Features = () => {
  return (
    <>
    <div className='lg:h-screen h-full w-full flex flex-col items-center justify-center xl:p-40 sm:p-20 py-5 px-10 pt-15 2xl:px-45  gap-8' id='features'>
        <div className='flex flex-col md:items-center justify-center gap-2 animate-slideDown [animation-timeline:view()]'>
            <p className='py-1 px-4 sm:py-2 sm:px-5 rounded-full md:text-base sm:text-sm text-xs border-2 border-neutral-400/50 bg-white text-primary'>Layanan untuk Warga</p>
            <h2 className='sm:text-5xl text-3xl font-semibold md:text-center text-primary'>Satu Tempat untuk Suara Rakyat</h2>
            <p className='md:text-xl text-sm md:text-center opacity-50'>
                Dengan desain sederhana dan proses transparan, partisipasi Anda menjadi lebih efektif dan berdampak nyata.
            </p>
        </div>
        <div className='grid lg:grid-cols-3 sm:gap-7 px-3 gap-5 animate-slideUp [animation-timeline:view()] '>
            <div className='h-full flex flex-col gap-2 bg-neutral-100 p-10 sm:px-10 items-start rounded-xl border-2 border-gray-400/50'>
                <img src='/landingpage/ppIcon.svg' alt='Pengaduan publik' className='aspect-square h-10 w-auto'/>
                <h3 className='md:text-2xl text-xl font-semibold text-primary '>Pengaduan Publik</h3>
                <p className='2xl:text-lg sm:text-sm text-xs font-extralight text-black/50'>
                    Laporkan masalah layanan & infrastruktur langsung dari ponsel Anda
                </p>
            </div>
            
            <div className='h-full flex flex-col gap-2 bg-neutral-100 p-10 sm:px-10 rounded-xl items-start border-2 border-gray-400/50'>
                <img src='/landingpage/vkIcon.svg' alt='Voting Kebijakan' className='aspect-square h-10 w-auto'/>
                <h3 className='md:text-2xl text-xl font-semibold text-primary'>Voting Kebijakan</h3>
                <p className='2xl:text-lg sm:text-sm text-xs font-extralight text-black/50'>
                    Ikut menentukan arah kebijakan negara dengan suara Anda.
                </p>
            </div>

            <div className='h-full flex flex-col gap-2 bg-neutral-100 p-10 sm:px-10 rounded-xl items-start border-2 border-gray-400/50'>
                <img src='/landingpage/dpIcon.svg' alt='Diskusi Publik' className='aspect-square h-10 w-auto'/>
                <h3 className='md:text-2xl text-xl font-semibold text-primary'>Diskusi Publik</h3>
                <p className='2xl:text-lg sm:text-sm text-xs font-extralight text-black/50'>
                    Bicara, dengar, dan cari solusi bersama warga lain.
                </p>
            </div>
        </div>
    </div>
    <div className='h-full w-full p-5 px-20'>
        <div className='h-full w-full grid grid-cols-2'>
            <div className='flex flex-col items-start justify-center gap-10'>
                <p className='py-1 px-4 sm:py-2 sm:px-5 rounded-full md:text-base sm:text-sm text-xs border-2 border-neutral-400/50 bg-white text-primary w-fit'>Kenapa Penting?</p>
                <h2 className='sm:text-5xl text-3xl font-semibold text-primary'>Karena Suara Rakyat Ada untuk Didengar</h2>
                <p className='md:text-xl text-sm opacity-50'>
                    Setiap laporan, suara, dan diskusi dari warga membantu menciptakan kebijakan yang lebih adil, layanan publik yang lebih baik, dan pemerintahan yang
                     transparan.
                </p>
            </div>
            <div className=''>
                <div className="h-full w-full aspect-video bg-[url('/landingpage/batik.svg')] bg-center bg-no-repeat rounded-3xl"></div>
            </div>
        </div>
    </div>
    </>
  )
}

export default Features