const links = [
  ['Home', '#home'],
  ['About', '#about'],
  ['Projects', '#projects'],
  ['Resume', '#resume'],
  ['Contact', '#contact'],
]

export default function Nav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-line bg-ink/70 px-8 py-[18px] backdrop-blur-md">
      <a href="#home" className="font-mono text-[0.78rem] uppercase tracking-[0.18em]">
        <span className="text-amber">§</span> Winxon&nbsp;Nguyen
      </a>
      <ul className="hidden gap-7 md:flex">
        {links.map(([label, href]) => (
          <li key={href}>
            <a
              href={href}
              className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted transition-colors hover:text-bone"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
