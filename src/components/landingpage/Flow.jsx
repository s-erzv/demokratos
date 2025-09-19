import React from 'react'

const Flow = () => {
  return (
    <>
        <div className='lg:h-screen h-full w-full flex flex-col md:items-center items-start justify-center 2xl:p-40 xl:px-20 sm:p-20 lg:px-12 lg:py-40 px-10 py-10 pt-20 lg:gap-20 sm:gap-10 gap-5 bg-neutral-200' id='flow'>
            <div className='flex flex-col md:items-center text-left items-start justify-center gap-5 animate-slideUp [animation-timeline:view()] text-text'>
                <p className='py-1 px-4 sm:py-2 sm:px-5 rounded-full md:text-base sm:text-sm text-xs border-2 border-neutral-400/50 bg-white text-primary'>Alur Partisipasi Anda</p>
                <h2 className='sm:text-4xl text-3xl font-semibold md:text-center text-primary'>Partisipasi yang Sederhana, Proses yang Transparan</h2>
                <p className='md:text-xl text-sm md:text-center opacity-50'>
                    Dalam beberapa langkah mudah, suara Anda langsung tercatat dan bisa dipantau
                </p>
            </div>
            <div className='grid lg:grid-cols-3 items-center text-primary justify-evenly sm:gap-10 gap-5 animate-slideUp [animation-timeline:view()]'>
                <div className='flex flex-col h-full gap-3 md:gap-5 md:px-15 bg-card p-10 rounded-2xl bg-white'>
                    <p className='rounded-full border-2 md:p-2 p-1 lg:p-2.5 text-base md:text-lg lg:text-xl font-bold w-fit aspect-square text-center border-flow-text text-flow-text'>1</p>
                    <h3 className='md:text-4xl text-2xl font-semibold text-flow-text'>Daftar / Masuk</h3>
                    <p className='md:text-lg text-sm font-extralight text-text'>
                        Buat akun dengan NIK & email untuk keamanan.
                    </p>
                </div>
                <div className='flex flex-col h-full gap-3 md:gap-5 md:px-15 bg-card p-10 rounded-2xl bg-white'>
                    <p className='rounded-full border-2 md:p-2 p-1 lg:p-2.5 text-base md:text-lg lg:text-xl font-bold w-fit aspect-square text-center border-flow-text text-flow-text'>2</p>
                    <h3 className='md:text-4xl text-2xl font-semibold text-flow-text'>Lapor, Voting, atau Diskusi</h3>
                    <p className='md:text-lg text-sm font-extralight text-text'>
                        Sampaikan masalah, berikan suara, atau ikut percakapan publik.
                    </p>
                </div>
                <div className='flex flex-col h-full gap-3 md:gap-5 md:px-15 bg-card p-10 rounded-2xl bg-white'>
                    <p className='rounded-full border-2 md:p-2 p-1 lg:p-2.5 text-base md:text-lg lg:text-xl font-bold w-fit aspect-square text-center border-flow-text text-flow-text'>3</p>
                    <h3 className='md:text-4xl text-2xl font-semibold text-flow-text'>Pantau Hasilnya</h3>
                    <p className='md:text-lg text-sm font-extralight text-text'>
                        Ikuti perkembangan laporan & kebijakan secara real-time.
                    </p>
                </div>
            </div>
        </div>
        <div className='h-screen w-full p-5 px-20 shadow-2xl'>
            <div className='h-full w-full grid grid-cols-2'>
                <div className=''>
                    <div className="h-full w-full aspect-video bg-[url('/landingpage/exampleVote.svg')] bg-center bg-no-repeat rounded-3xl"></div>
                </div>
                <div className='flex flex-col items-start justify-center gap-10'>
                    <p className='py-1 px-4 sm:py-2 sm:px-5 rounded-full md:text-base sm:text-sm text-xs border-2 border-neutral-400/50 bg-white text-primary w-fit'>Partisipasi yang Sudah Terjadi</p>
                    <h2 className='sm:text-5xl text-3xl font-semibold text-primary'>Ribuan Suara Terkumpul, Ratusan Masalah Tertangani</h2>
                    <p className='md:text-xl text-sm opacity-50'>
                        Partisipasi warga yang terus bertumbuh.
                    </p>
                </div>
            </div>
        </div>
    </>
  )
}

export default Flow