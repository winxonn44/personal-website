import Eyebrow from './Eyebrow.jsx'
import Reveal from './Reveal.jsx'
import GhostTitle from './GhostTitle.jsx'
import BracketButton from './BracketButton.jsx'
import Footer, { CopyEmail } from './Footer.jsx'

const EMAIL = 'winxonnguyen44@gmail.com'

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-x-clip pt-[120px]">
      <GhostTitle>Contact</GhostTitle>
      <div className="relative mx-auto max-w-content px-8">
        <Eyebrow num="§05">Contact</Eyebrow>
        <div className="scrim w-fit max-w-full">
          <Reveal as="h3" className="font-display text-[clamp(2.4rem,7vw,5rem)] font-[350] leading-none tracking-[-0.02em]">
            Build something difficult.
          </Reveal>
          {/* F3: the address copies on click; mailto stays one click away. */}
          <Reveal as="p" className="mt-6 max-w-full">
            <CopyEmail email={EMAIL} className="max-w-full font-mono text-[clamp(0.95rem,2.4vw,1.4rem)] tracking-[0.02em]" />
          </Reveal>
          <Reveal as="p" className="-ml-[1.1rem] mt-5 flex flex-wrap items-center gap-x-1 gap-y-1">
            <BracketButton href={`mailto:${EMAIL}`}>Email ↗</BracketButton>
            <BracketButton href="https://github.com/winxonn44" target="_blank" rel="noreferrer">GitHub ↗</BracketButton>
            <BracketButton href="https://www.linkedin.com/in/winxon-nguyen-ba166336b/" target="_blank" rel="noreferrer">LinkedIn ↗</BracketButton>
          </Reveal>
        </div>
      </div>
      <Footer />
    </section>
  )
}
