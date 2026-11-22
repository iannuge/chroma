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
    const W = window.innerWidth,
      H = window.innerHeight
    const pos = [
      { sel: '.top3 .r1', x: W * 0.7, y: H * 0.3, x0: W * 0.72, y0: H * 0.3, k: '' },
      { sel: '.top3 .r2', x: W * 0.3, y: H * 0.35, x0: W * 0.3, y0: H * 0.35, k: '2' },
      { sel: '.top3 .r3', x: W * 0.8, y: H * 0.5, x0: W * 0.8, y0: H * 0.5, k: '3' },
    ]
    let s = 0,
      prev = window.scrollY,
      raf = 0

    const frame = (now) => {
      const home = !!document.querySelector('.top3 .r1')
      el.classList.toggle('calm', !home)
      const k = still ? 1 : home ? 0.07 : 0.015
      pos.forEach((p, i) => {
        let tx, ty
        if (home) {
          const node = document.querySelector(p.sel)
          if (node) {
            const r = node.getBoundingClientRect()
            tx = r.left + r.width / 2
            ty = Math.max(-r.height, Math.min(H + r.height, r.top + r.height / 2))
          } else {
            tx = p.x0
            ty = p.y0
          }
        } else if (still) {
          tx = p.x0
          ty = p.y0
        } else {
          // no ranking on this page: drift slowly on their own
          const t = now / 1000
          tx = W * (0.5 + 0.38 * Math.sin(t * 0.07 + i * 2.1))
          ty = H * (0.5 + 0.34 * Math.cos(t * 0.05 + i * 1.7))
        }
        p.x += (tx - p.x) * k
        p.y += (ty - p.y) * k
        el.style.setProperty('--gx' + p.k, p.x.toFixed(1) + 'px')
        el.style.setProperty('--gy' + p.k, p.y.toFixed(1) + 'px')
      })
      const v = window.scrollY - prev
      prev = window.scrollY
      s += (Math.max(-60, Math.min(60, v)) - s) * 0.12
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
      <i className="bd-c bd-o2" />
      <i className="bd-c bd-o3" />
      <i className="bd-vig" />
    </div>
  )
}
