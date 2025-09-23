import React from 'react'

import Hero from '../components/landingpage/Hero'
import IdNavbar from '../components/landingpage/idNavBar'
import Features from '../components/landingpage/Features'
import Flow from '../components/landingpage/Flow'
import Team from '../components/landingpage/Team'
import Footer from '../components/landingpage/Footer'

const Landing = () => {
  return (
    <div>
        <IdNavbar/>
        <Hero/>
        <Features/>
        <Flow/>
        <Team/>
        <Footer/>
    </div>
  )
}

export default Landing