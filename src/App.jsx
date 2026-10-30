import { LazyMotion, MotionConfig, domMax } from 'motion/react'
import Nav from './components/Nav.jsx'
import SectionRail from './components/SectionRail.jsx'
import Background from './components/Background.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Projects from './components/Projects.jsx'
import Resume from './components/Resume.jsx'
import Hobbies from './components/Hobbies.jsx'
import Contact from './components/Contact.jsx'

// Motion runs through LazyMotion + `m` components with the
// domMax feature set (layout animations, for the nav's sliding dot);
// reducedMotion="user" drops transform animations
// for visitors who ask for less motion.
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax}>
        <Nav />
        <SectionRail />
        <Background />
        <main className="relative z-[1]">
          <Hero />
          <About />
          <Projects />
          <Resume />
          <Hobbies />
          <Contact />
        </main>
      </LazyMotion>
    </MotionConfig>
  )
}
