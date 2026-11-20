'use client'

import { useEffect, useRef } from 'react'
import { HIDDEN_ART } from '../lib/util'

export default function TeeHero() {
  const tee = useRef(null)
  const box = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let mx = 0,
      my = 0,
      tx = 0,
      ty = 0,
      sy = window.scrollY,
      prev = window.scrollY,
      vel = 0,
      raf = 0
    const move = (e) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1
      my = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })
    const frame = (t) => {
      const y = window.scrollY
      vel += (y - prev - vel) * 0.2
      prev = y
      sy += (y - sy) * 0.08
      tx += (mx - tx) * 0.06
      ty += (my - ty) * 0.06
      if (y < window.innerHeight * 1.5 && tee.current && box.current) {
        tee.current.style.transform =
          'translateY(' + (Math.sin(t / 2800) * 6) + 'px) rotateX(' + -ty * 4 +
          'deg) rotateY(' + tx * 6 + 'deg) rotateZ(' + Math.sin(t / 4600) * 0.4 + 'deg)'
        const d = Math.max(-7, Math.min(7, vel * 0.25))
        box.current.style.transform =
          'translate(' + tx * 16 + 'px,' + (ty * 10 + sy * 0.2 + Math.sin(t / 2200 + 1) * 5) +
          'px) rotate(' + (-3 + d) + 'deg)'
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
    }
  }, [])

  return (
    <div className="tw">
      <div className="tee" ref={tee}>
        <img src="/tee.webp" alt="White t-shirt with its graphic hidden behind a blur" />
        <div className="hid" style={{ background: HIDDEN_ART }} />
        <div className="cens" ref={box} />
      </div>
    </div>
  )
}
