import Eyebrow from './Eyebrow.jsx'

export default function Contact() {
  return (
    <section id="contact" className="py-[120px]">
      <div className="mx-auto max-w-content px-8">
        <Eyebrow num="§04">Contact</Eyebrow>
        <h3 data-reveal className="font-display text-[clamp(2.4rem,7vw,5rem)] font-[350] leading-none tracking-[-0.02em]">
          Build something difficult.
        </h3>
        <p data-reveal className="mt-6">
          <a
            href="mailto:winxonnguyen44@gmail.com"
            className="border-b border-transparent font-mono text-[clamp(1rem,2.4vw,1.4rem)] tracking-[0.02em] text-amber hover:border-amber"
          >
            winxonnguyen44@gmail.com
          </a>
        </p>
        <p data-reveal className="mt-4 font-mono text-[0.8rem] uppercase tracking-[0.12em] text-muted">
          <a href="https://github.com/winxonn44" target="_blank" rel="noreferrer" className="hover:text-bone">GitHub ↗</a> &nbsp;·&nbsp;
          <a href="https://www.linkedin.com/in/winxon-nguyen-ba166336b/" target="_blank" rel="noreferrer" className="hover:text-bone">LinkedIn ↗</a> &nbsp;·&nbsp;
          Los Angeles, CA
        </p>
        <footer className="mt-[100px] border-t border-line pt-8 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">
          Winxon Nguyen — 2026
        </footer>
      </div>
    </section>
  )
}
