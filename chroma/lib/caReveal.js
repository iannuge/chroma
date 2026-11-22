// Opening an element: start with heavy chromatic aberration, snap together fast, and leave it clean.
// Drives the dedicated #ca-in filter (see components/Aberration.jsx) on the target for `ms`, then removes it.
export function caReveal(el, { ms = 850, amount = 16 } = {}) {
  if (typeof window === 'undefined' || !el) return () => {}
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.style.filter = 'none'
    return () => {}
  }
  const r = document.getElementById('ca-in-r')
  const b = document.getElementById('ca-in-b')
  if (!r || !b) {
    el.style.filter = 'none'
    return () => {}
  }
  let raf = 0
  const t0 = performance.now()
  el.style.filter = 'url(#ca-in)'
  const frame = (now) => {
    const p = Math.min(1, (now - t0) / ms)
    const e = Math.pow(1 - p, 3) // fast out, long clean tail
    const a = amount * e
    r.setAttribute('dx', (-a).toFixed(2))
    r.setAttribute('dy', (-a * 0.25).toFixed(2))
    b.setAttribute('dx', a.toFixed(2))
    b.setAttribute('dy', (a * 0.25).toFixed(2))
    if (p < 1) raf = requestAnimationFrame(frame)
    else el.style.filter = 'none'
  }
  raf = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(raf)
}
