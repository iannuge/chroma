// Opening an element: start with heavy chromatic aberration, snap together fast, and leave it clean.
// The split is two colored ghosts (red one way, blue the other) behind the element, so the element's own
// colors and transparency are never touched (the old channel-split filter darkened anything translucent).
export function caReveal(el, { ms = 850, amount = 16 } = {}) {
  if (typeof window === 'undefined' || !el) return () => {}
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.style.filter = 'none'
    return () => {}
  }
  let raf = 0
  const t0 = performance.now()
  const frame = (now) => {
    const p = Math.min(1, (now - t0) / ms)
    const e = Math.pow(1 - p, 3) // fast out, long clean tail
    const a = amount * e
    if (p >= 1) {
      el.style.filter = 'none'
      return
    }
    const al = (0.75 * Math.min(1, e * 1.6)).toFixed(3)
    el.style.filter =
      'drop-shadow(' + (-a).toFixed(2) + 'px ' + (-a * 0.25).toFixed(2) + 'px 0 rgba(255,30,70,' + al + ')) ' +
      'drop-shadow(' + a.toFixed(2) + 'px ' + (a * 0.25).toFixed(2) + 'px 0 rgba(0,110,255,' + al + '))'
    raf = requestAnimationFrame(frame)
  }
  el.style.filter = 'none'
  raf = requestAnimationFrame(frame)
  return () => {
    cancelAnimationFrame(raf)
    el.style.filter = 'none'
  }
}
