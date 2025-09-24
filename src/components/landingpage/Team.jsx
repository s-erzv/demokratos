import React from "react";
import Arjuna from "../../assets/Arjuna.jpg";
import Sarah from "../../assets/Sarah.png";
import Ihsan from "../../assets/Ihsan.jpg";
import Crew from "./subComponent/crew";

const Team = () => {

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
        <div className="flex sm:flex-row flex-col w-full h-fit items-center justify-evenly gap-5">
          <Crew nama={"Arjuna Ragil P."} image={Arjuna} github={"https://github.com/Arjuna-Ragil"} linkedin={"www.linkedin.com/in/arjunaragilputera"} instagram={"https://www.instagram.com/arjuna_ragill/"}/>
          <Crew nama={"Sarah Fajriah R."} image={Sarah} github={"https://github.com/s-erzv"} linkedin={"https://www.linkedin.com/in/serzv/"} instagram={"https://www.instagram.com/s.erzv"}/>
          <Crew nama={"Ahmad Ihsan"} image={Ihsan} github={"https://github.com/amdihsann"} linkedin={"https://www.linkedin.com/in/ahmadihsan-/"} instagram={"https://www.instagram.com/iiisssnnnnn/"}/>
        </div>
      </div>
    </div>
  );
};

export default Team;