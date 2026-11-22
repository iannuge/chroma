'use client'

import { useEffect, useRef } from 'react'

// Page background: a faint spec-sheet grid with registration marks, and one orange glow
// that sits behind the current #1 cluster. Its red and blue fringes split apart with scroll speed.
export default function Backdrop() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let x = window.innerWidth * 0.7,
      y = window.innerHeight * 0.3,
      s = 0,
      prev = window.scrollY,
      raf = 0

    const frame = () => {
      const top = document.querySelector('.top3 .r1') || document.querySelector('[data-flip].cw')
      let tx = window.innerWidth * 0.72,
        ty = window.innerHeight * 0.3
      if (top) {
        const r = top.getBoundingClientRect()
        tx = r.left + r.width / 2
        ty = Math.max(-r.height, Math.min(window.innerHeight + r.height, r.top + r.height / 2))
      }
      const k = still ? 1 : 0.07
      x += (tx - x) * k
      y += (ty - y) * k
      const v = window.scrollY - prev
      prev = window.scrollY
      s += (Math.max(-60, Math.min(60, v)) - s) * 0.12
      el.style.setProperty('--gx', x.toFixed(1) + 'px')
      el.style.setProperty('--gy', y.toFixed(1) + 'px')
      el.style.setProperty('--gs', (still ? 0 : s * 1.1).toFixed(2) + 'px')
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="bd" ref={ref} aria-hidden="true">
      <i className="bd-grid" />
      <i className="bd-marks" />
      <i className="bd-c bd-r" />
      <i className="bd-c bd-b" />
      <i className="bd-c bd-o" />
      <i className="bd-vig" />
    </div>
  )
}
