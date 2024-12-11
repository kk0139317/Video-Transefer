import React from 'react'
import HeroSecction from '@/components/HeroSecction'
import Team from '@/components/HeroSecction/Team'
import NavBar from '@/components/NavBar'

const page = () => {
  return (
    <>
    <NavBar />
    <HeroSecction />
        
    <Team />
    </>
  )
}

export default page