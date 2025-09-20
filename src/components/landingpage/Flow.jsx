import React from 'react'
import Header from './subComponent/header'
import FlowCard from './subComponent/flowCard'

const Flow = () => {
  return (
    <>
        <div className='lg:h-screen h-full w-full flex flex-col items-center justify-center 2xl:p-40 xl:px-20 sm:p-20 lg:px-12 lg:py-40 px-10 py-10 pt-20 lg:gap-15 sm:gap-10 gap-5 bg-neutral-200' id='flow'>
            <Header intro={'Alur Partisipasi Anda'} title={'Partisipasi yang Sederhana, Proses yang Transparan'} 
                desc={'Dalam beberapa langkah mudah, suara Anda langsung tercatat dan bisa dipantau'}
            />
            <div className='grid lg:grid-cols-3 items-center text-primary justify-evenly sm:gap-10 gap-5 animate-slideUp [animation-timeline:view()]'>
                <FlowCard step={1} title='Daftar / Masuk' desc='Buat akun dengan NIK & email untuk keamanan.'/>
                <FlowCard step={2} title='Lapor, Voting, atau Diskusi' desc='Sampaikan masalah, berikan suara, atau ikut percakapan publik.'/>
                <FlowCard step={3} title='Pantau Hasilnya' desc='Ikuti perkembangan laporan & kebijakan secara real-time.'/>
            </div>
        </div>
        <div className='h-full w-full p-20 shadow-2xl'>
            <div className='h-full w-full md:grid md:grid-cols-2 gap-5'>
                <div className=''>
                    <div className="h-full w-full aspect-video bg-[url('/landingpage/exampleVote.svg')] bg-center bg-no-repeat rounded-3xl max-md:hidden"></div>
                </div>
                <Header intro={'Partisipasi yang Sudah Terjadi'} title={'Ribuan Suara Terkumpul, Ratusan Masalah Tertangani'}
                    desc={'Partisipasi warga yang terus bertumbuh.'}
                />
            </div>
        </div>
    </>
  )
}

export default Flow