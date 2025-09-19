import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen h-full w-full p-5">
      <div
        className={`h-full w-full bg-[url('/landingpage/heroBg.svg')] relative`}
        id="hero"
      >
        <div className="h-screen w-full bg-gradient-to-b from-white to-transparent from-30% flex flex-col items-center justify-center gap-10">

          <p className="py-1 px-4 sm:py-2 sm:px-5 rounded-full lg:text-xl md:text-lg sm:text-sm text-xs border-2 border-neutral-400/50 bg-white text-secondary">
            Transparan • Praktis • Demokratis
          </p>
          <h1 className="lg:text-7xl md:text-6xl sm:text-5xl text-4xl font-bold text-center text-primary">
            Partisipasi Mudah, Dampak Nyata
          </h1>
          <h2 className="lg:text-2xl md:text-lg text-sm text-center">
            Ikut serta dalam pengaduan publik, voting kebijakan, dan diskusi warga demi pemerintahan yang transparan
          </h2>
          <div className="flex flex-row gap-5">
            <button onClick={() => navigate("/login")} className="md:px-10 md:py-4 px-5 py-2 sm:py-3 sm:px-6 bg-primary hover:brightness-125 duration-200 2xl:text-3xl lg:text-2xl md:text-2xl sm:text-sm text-xs rounded-full text-white">
              Daftar Sekarang
            </button>
            <button className="md:px-10 md:py-4 px-5 py-2 sm:py-3 sm:px-6 duration-200 2xl:text-3xl lg:text-2xl md:text-2xl sm:text-sm text-xs rounded-full relative border-2 border-secondary z-10 group">
              <a href="/#flow" className="absolute inset-0 h-full w-full rounded-full z-10"></a>
              <p className="z-10 text-primary">Berikan Suara</p>
              <div className="h-full w-full bg-white blur-sm absolute inset-0 rounded-full opacity-50 -z-10 group-hover:opacity-100 duration-150"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;