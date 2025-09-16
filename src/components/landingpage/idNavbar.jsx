import React, { useState } from "react";
import Hamburger from "../../assets/hamburger.svg";
import { useNavigate } from "react-router-dom";

const IdNavbar = () => {
  const [seeMore, setSeeMore] = useState(false);
  const navigate = useNavigate();
  const handleGetStartedClick = () => {
    navigate('/login');
  };

  return (
    <div className="w-full flex flex-col gap-2 fixed z-50">
      <div className="w-full flex flex-row  items-center z-50 relative">
        <div className="h-full w-full absolute animate-translucent [animation-timeline:scroll(root)] bg-white/50 backdrop-blur-2xl -z-10 border-b-2 border-white/70"></div>
        <div className="w-full flex flex-row items-center md:justify-around justify-between md:p-4 py-3 px-5 sm:px-10">
          <div className="flex justify-center items-center gap-5 2xl:gap-7">
            <img src="/logo light.svg" alt="Planix Logo" className='2xl:size-15 size-10 block' />
              <a className="lg:text-4xl md:text-2xl 2xl:text-5xl text-lg font-bold" href="/#hero">
               Planix
              </a>
          </div>
        
          <div className="flex flex-row gap-10 2xl:text-3xl text-xl max-md:hidden 2xl:gap-13">
            <a
              className="hover:border-b-2 border-hover-button duration-100 hover:scale-105"
              href="/#features"
            >
              Features
            </a>
            <a
              className="hover:border-b-2 border-hover-button duration-100 hover:scale-105"
              href="/#demo"
            >
              Demo
            </a>
            <a
              className="hover:border-b-2 border-hover-button duration-100 hover:scale-105"
              href="/#flow"
            >
              How it Works
            </a>
            <a
              className="hover:border-b-2 border-hover-button duration-100 hover:scale-105"
              href="/#team"
            >
              Our Team
            </a>
          </div>
          <div className="flex flex-row gap-3 items">
            <button 
            onClick={handleGetStartedClick}
            className="2xl:text-2xl md:text-lg sm:text-sm text-xs bg-primary duration-200 origin-left rounded-full relative group flex items-center overflow-hidden">
              <div className="w-full h-full absolute bg-hover-button scale-x-0 group-hover:scale-x-100 duration-500 origin-left rounded-full inset-0 ease-in-out"></div>
              <p className="py-2 px-4 2xl:py-4 2xl:text-2xl 2xl:px-6 z-50 text-white font-semibold ">Get Started</p>
            </button>
            <img
              src={Hamburger}
              alt="See More"
              className="md:hidden invert size-5 my-auto"
              onClick={() => setSeeMore((prev) => !prev)}
            />
          </div>
        </div>
      </div>
      
      <div
        className={`bg-card text-white p-3 z-50 w-fit font-semibold self-end 
          flex flex-col gap-2 sm:text-sm text-xs duration-200 rounded-2xl origin-top-right text-center 
          md:hidden sm:mr-5 mr-2
          ${seeMore ? "scale-100" : "scale-0"}`}
      >
        <a
          className=" bg-primary py-2 px-4 rounded-xl"
          href="/#features"
          onClick={() => setSeeMore(false)}
        >
          Features
        </a>
        <a
          className=" bg-primary py-2 px-4 rounded-xl"
          href="/#demo"
          onClick={() => setSeeMore(false)}
        >
          Demo
        </a>
        <a
          className=" bg-primary py-2 px-4 rounded-xl"
          href="/#flow"
          onClick={() => setSeeMore(false)}
        >
          How it Works
        </a>
        <a
          className="bg-primary py-2 px-4 rounded-xl"
          href="/#team"
          onClick={() => setSeeMore(false)}
        >
          Our Team
        </a>
      </div>
    </div>
  );
};

export default IdNavbar;