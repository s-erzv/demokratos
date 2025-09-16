import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate()

  return (
    <div
      className={`md:h-full h-screen w-full bg-[url('/landingpage/heroBg.svg')] relative`}
      id="hero"
    >
      <div className="h-full w-full bg-gradient-to-b from-transparent to-secondary from-30% flex flex-col 
      md:justify-end justify-center md:items-center items-start gap-5 md:gap-10 sm:px-17 px-10 lg:pt-40 md:pt-25">

        <p className="py-1 px-4 sm:py-2 sm:px-5 bg-hero rounded-full lg:text-xl md:text-lg sm:text-sm text-xs">
          🌿 Build better with data-driven planning
        </p>
        <h1 className="lg:text-8xl md:text-6xl sm:text-5xl text-4xl font-bold md:text-center">
          The Smarter Way To Plan Sustainable Regions
        </h1>
        <h2 className="lg:text-2xl md:text-lg text-sm md:text-center">
          Use data, maps, and AI to design smarter zones for people, nature, and
          the future.
        </h2>
        <div className="flex flex-row gap-5">
          <button onClick={() => navigate("/login")} className="md:px-10 md:py-4 px-5 py-2 sm:py-3 sm:px-6 bg-secondary hover:bg-primary duration-200 2xl:text-4xl lg:text-2xl md:text-2xl sm:text-sm text-xs rounded-full">
            Start Planning
          </button>
          <button className="md:px-10 md:py-4 px-5 py-2 sm:py-3 sm:px-6 bg-white hover:bg-neutral-300 duration-200 2xl:text-4xl lg:text-2xl md:text-2xl sm:text-sm text-xs rounded-full relative">
            <a href="/#flow" className="absolute inset-0 h-full w-full rounded-full"></a>
            <p>See How It Works</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;