import React from "react";
import Footer from "./Footer";
import github from "../../assets/github.svg";
import instagram from "../../assets/instagram.svg";
import linkedin from "../../assets/linkedin.svg";

const Team = () => {
  const Juna = 
  `
    kinda proud making this website. Quite the step up from my previous projects. More advanced, more complex, and more fun to work on with the team.
  `
  const Ihsan = 
  `
    Collaboration is the key to transformation. Our team unites technology, creativity, and research to build a sustainable urban future.
    Alone we can do so little, together we can do so much. We believe teamwork turns ideas into impactful innovation.
    Great minds build greater futures. Together we are shaping smarter cities.
  `

  const Sarah = 
  `
    Always curious about building stuff that’s useful. Planix was a chance to push myself—mixing design, code, and real-world problems into something more impactful. Still learning, still growing, but proud of where this is going.
  `

  return (
    <div className='h-full w-full flex flex-col items-center justify-center gap-10 lg:px-20 relative  p-6 sm:px-15 pb-10 bg-[url("/landingpage/heroBg.svg")] z-10'>
      <div className="h-screen w-full bg-gradient-to-b from-neutral-100 to-transparent from-30% flex flex-col items-center justify-center gap-10 absolute inset-0 -z-10"></div>
      <div
        className="h-full w-full flex flex-col items-center justify-center gap-10 sm:pt-25 pt-15"
        id="team">
        <div className="flex flex-col sm:items-center items-start justify-center gap-5 animate-slideDown [animation-timeline:view()]">
          <p className='py-1 px-4 sm:py-2 sm:px-5 rounded-full md:text-base sm:text-sm text-xs border-2 border-neutral-400/50 bg-white text-primary'>Tim di Balik Aplikasi</p>
          <h2 className="md:text-5xl sm:text-4xl text-3xl font-semibold sm:text-center">
            <span>Membangun Alat </span> 
            <span className="text-primary">untuk Rakyat, oleh Rakyat</span>
          </h2>
          <p className="md:text-2xl sm:text-sm text-xs font-medium sm:text-center md:px-5 lg:px-40">
            Kami adalah tim yang percaya bahwa suara warga harus mudah disampaikan dan benar-benar didengar. Karena itu, 
            kami membangun aplikasi ini untuk mempermudah pelaporan masalah, voting kebijakan, dan diskusi publik dalam 
            satu tempat.
          </p>
        </div>
        <div className="h-full w-full grid md:grid-cols-3 gap-10">
          <div className="md:h-125 w-full h-100 group flex justify-center animate-slideLeft [animation-timeline:view()]">
            <div className="p-3 lg:w-100 md:w-60 bg-card rounded-2xl h-full sm:w-1/2 w-full md:group-hover:rotate-y-180 max-md:group-active:rotate-y-180 duration-300 shadow-2xl">
              <div className="bg-[url('/landingpage/Juna.svg')] h-full w-full bg-cover bg-center rounded-2xl md:group-hover:hidden max-md:group-active:hidden">
                <div className="h-full w-full bg-gradient-to-b from-transparent from-30% to-white rounded-2xl p-3 flex flex-col justify-between">
                  <p className="bg-secondary p-1 px-5 rounded-full w-fit">
                    Full Stack Developer
                  </p>
                  <p className="text-3xl font-bold text-team">Arjuna Ragil Putera</p>
                </div>
              </div>
              <div className="h-full hidden md:group-hover:flex max-md:group-active:flex flex-col justify-between rotate-y-180 p-5 bg-white rounded-2xl">
                <div className="flex flex-col gap-5">
                  <h3 className="text-3xl font-bold text-flow-gradient">
                    Arjuna Ragil Putera
                  </h3>
                  <p className="text-team-text 2xl:text-2xl text-lg">Full Stack Developer</p>
                  <p className="font-extralight text-team-text 2xl:text-xl">{Juna}</p>
                </div>
                <div className="flex flex-row gap-3">
                  <a
                    href="https://github.com/Arjuna-Ragil"
                    target="_blank"
                    className="aspect-square w-auto h-7 rounded-full bg-card hover:bg-lime-500 duration-150 p-1 flex items-center justify-center"
                  >
                    <img src={github} alt="Github"/>
                  </a>
                  <a
                    href="www.linkedin.com/in/arjunaragilputera"
                    target="_blank"
                    className="aspect-square w-auto h-7 rounded-full bg-card hover:bg-lime-500 duration-150 p-1 flex items-center justify-center"
                  >
                    <img src={linkedin} alt="Linkedin"/>
                  </a>
                  <a
                    href="https://www.instagram.com/arjuna_ragill/"
                    target="_blank"
                    className="aspect-square w-auto h-7 rounded-full bg-card hover:bg-lime-500 duration-150 p-1 flex items-center justify-center"
                  >
                    <img src={instagram} alt="Instagram"/>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="md:h-125 w-full h-100 flex justify-center group animate-slideLeft [animation-timeline:view()]">
            <div className="p-3 lg:w-100 md:w-60 bg-card rounded-2xl h-full sm:w-1/2 w-full md:group-hover:rotate-y-180 max-md:group-active:rotate-y-180 duration-300 shadow-2xl">
              <div className="bg-[url('/landingpage/Ihsan.svg')] h-full w-full bg-cover bg-center rounded-2xl md:group-hover:hidden max-md:group-active:hidden">
                <div className="h-full w-full bg-gradient-to-b from-transparent from-30% to-white rounded-2xl p-3 flex flex-col justify-between">
                  <p className="bg-secondary p-1 px-5 rounded-full w-fit">
                    Full Stack Developer
                  </p>
                  <p className="text-3xl font-bold text-team">Ahmad Ihsan</p>
                </div>
              </div>
              <div className="h-full hidden md:group-hover:flex max-md:group-active:flex flex-col justify-between rotate-y-180 p-5 bg-white rounded-2xl">
                <div className="flex flex-col gap-5">
                  <h3 className="text-3xl font-bold text-flow-gradient">
                    Ahmad Ihsan
                  </h3>
                  <p className="text-team-text 2xl:text-2xl text-lg">Full Stack Developer</p>
                  <p className="text-team-text font-extralight 2xl:text-base max-md:text-xs">{Ihsan}</p>
                </div>
                <div className="flex flex-row gap-3">
                  <a
                    href="https://github.com/amdihsann"
                    target="_blank"
                    className="aspect-square w-auto h-7 rounded-full bg-card hover:bg-lime-500 duration-150 p-1 flex items-center justify-center"
                  >
                    <img src={github} alt="Github"/>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/ahmadihsan-/"
                    target="_blank"
                    className="aspect-square w-auto h-7 rounded-full bg-card hover:bg-lime-500 duration-150 p-1 flex items-center justify-center"
                  >
                   <img src={linkedin} alt="Linkedin"/>
                  </a>
                  <a
                    href="https://www.instagram.com/iiisssnnnnn/"
                    target="_blank"
                    className="aspect-square w-auto h-7 rounded-full bg-card hover:bg-lime-500 duration-150 p-1 flex items-center justify-center"
                  >
                    <img src={instagram} alt="Instagram"/>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="md:h-125 md:w-full w-auto h-100 flex justify-center group animate-slideLeft [animation-timeline:view()]">
            <div className="p-3 lg:w-100 md:w-60 bg-card rounded-2xl h-full sm:w-1/2 w-full md:group-hover:rotate-y-180 max-md:group-active:rotate-y-180 duration-300 shadow-2xl">
              <div className="bg-[url('/landingpage/Sarah.svg')] h-full w-full bg-cover bg-center rounded-2xl md:group-hover:hidden max-md:group-active:hidden">
                <div className="h-full w-full bg-gradient-to-b from-transparent from-30% to-white rounded-2xl p-3 flex flex-col justify-between">
                  <p className="bg-secondary p-1 px-5 rounded-full w-fit">
                    Full Stack Developer
                  </p>
                  <p className="text-3xl font-bold text-team">Sarah Fajriah R.</p>
                </div>
              </div>
              <div className="h-full hidden md:group-hover:flex max-md:group-active:flex flex-col justify-between rotate-y-180 p-5 bg-white rounded-2xl">
                <div className="flex flex-col gap-5">
                  <h3 className="text-3xl font-bold text-flow-gradient">
                    Sarah Fajriah R.
                  </h3>
                  <p className="text-team-text">Full Stack Developer</p>
                  <p className="font-extralight text-team-text">{Sarah}</p>
                </div>
                <div className="flex flex-row gap-3">
                  <a
                    href="https://github.com/s-erzv"
                    target="_blank"
                    className="aspect-square w-auto h-7 rounded-full bg-card hover:bg-lime-500 duration-150 p-1 flex items-center justify-center"
                  >
                    <img src={github} alt="Github"/>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/serzv/"
                    target="_blank"
                    className="aspect-square w-auto h-7 rounded-full bg-card hover:bg-lime-500 duration-150 p-1 flex items-center justify-center"
                  >
                    <img src={linkedin} alt="Linkedin" />
                  </a>
                  <a
                    href="https://www.instagram.com/s.erzv"
                    target="_blank"
                    className="aspect-square w-auto h-7 rounded-full bg-card hover:bg-lime-500 duration-150 p-1 flex items-center justify-center"
                  >
                    <img src={instagram} alt="Instagram"/>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;