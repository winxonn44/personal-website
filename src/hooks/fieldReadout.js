// Tiny bridge between the fixed background field and the hero's live
// `(x, y)` readout. The hero hands over its <span> as a callback ref; the
// field's render loop writes text into it directly (no React re-renders).
let target = null

export const setReadoutTarget = (node) => {
  target = node
}

export const hasReadoutTarget = () => target !== null

export const writeReadout = (text) => {
  if (target && target.textContent !== text) target.textContent = text
}
