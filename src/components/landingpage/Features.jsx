import React from 'react'
import FeatCard from './subComponent/featCard'
import Header from './subComponent/header'

const Features = () => {
  return (
    <>
        <div className='lg:h-screen h-full w-full flex flex-col items-center justify-center xl:p-40 sm:p-20 px-10 pt-20 2xl:px-45  gap-8' id='features'>
            <Header intro={'Layanan untuk Warga'} title={'Satu Tempat untuk Suara Rakyat'} 
                desc={'Dengan desain sederhana dan proses transparan, partisipasi Anda menjadi lebih efektif dan berdampak nyata.'}
            />
            <div className='grid lg:grid-cols-3 sm:gap-7 px-3 gap-5 animate-slideUp [animation-timeline:view()] '>
                <FeatCard icon='/landingpage/ppIcon.svg' title='Pengaduan Publik' 
                    desc='Laporkan masalah layanan & infrastruktur langsung dari ponsel Anda'
                />
                <FeatCard icon='/landingpage/vkIcon.svg' title='Voting Kebijakan' 
                    desc='Ikut menentukan arah kebijakan negara dengan suara Anda.'
                />
                <FeatCard icon='/landingpage/dpIcon.svg' title='Diskusi Publik' 
                    desc='Bicara, dengar, dan cari solusi bersama warga lain.'
                />
            </div>
        </div>
        <div className='h-full w-full p-5 pb-10 px-20'>
            <div className='h-full w-full md:grid md:grid-cols-2 gap-5'>
                <Header intro={'Kenapa Penting?'} title={'Karena Suara Rakyat Ada untuk Didengar'} 
                    desc={'Setiap laporan, suara, dan diskusi dari warga membantu menciptakan kebijakan yang lebih adil, layanan publik yang lebih baik, dan pemerintahan yang transparan.'}
                />
                <div className="h-full w-full aspect-video bg-[url('/landingpage/batik.svg')] bg-center bg-no-repeat rounded-3xl max-md:hidden"></div>
            </div>
        </div>
    </>
  )
}

export default Features