import { Github, Instagram, Linkedin } from "lucide-react";

export default function Crew({nama, image, github, linkedin, instagram}){
    return(
        <div className="flex flex-col items-center gap-5 bg-primary text-white p-5 rounded-2xl border-2 border-secondadry shadow-xl">
            <h2>{nama}</h2>
            <img src={image} alt="foto Juna" className="aspect-square h-40 w-auto"/>
            <div className="flex flex-row gap-5">
                <a href={github} target="_blank"><Github /></a>
                <a href={linkedin} target="_blank"><Linkedin /></a>
                <a href={instagram} target="_blank"><Instagram /></a>
            </div>
        </div>
    )
}