// Corner-bracket button (DESIGN-v2 C5): four L-shaped corners that move 3px
// inward on hover/focus while the label turns amber, like a targeting reticle.
// Styling lives in index.css (.bracket-btn). Renders a link by default.
//
//   <BracketButton href="#projects">See VoroNav ↓</BracketButton>
export default function BracketButton({ as: Comp = 'a', className = '', children, ...rest }) {
  return (
    <Comp className={`bracket-btn ${className}`} {...rest}>
      <span className="bracket tl" aria-hidden="true" />
      <span className="bracket tr" aria-hidden="true" />
      <span className="bracket bl" aria-hidden="true" />
      <span className="bracket br" aria-hidden="true" />
      {children}
    </Comp>
  )
}
