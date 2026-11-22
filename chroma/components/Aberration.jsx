'use client'

import { useEffect } from 'react'

// Chromatic aberration that reacts to the pointer and to scrolling.
// It drives the red/blue offsets of the shared SVG filter (#ca) and the fringe on headlines.
export default function Aberration() {
  useEffect(() => {
    const r = document.getElementById('ca-r')
    const b = document.getElementById('ca-b')
    const root = document.documentElement
    if (!r || !b) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let mx = 0,
      my = 0,
      tx = 0,
      ty = 0,
      prev = window.scrollY,
      vel = 0,
      lastX = -1,
      lastY = -1,
      raf = 0

    const move = (e) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1
      my = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })

    const frame = (t) => {
      const y = window.scrollY
      vel += (y - prev - vel) * 0.15
      prev = y
      tx += (mx - tx) * 0.05
      ty += (my - ty) * 0.05

      const energy = Math.min(1, Math.abs(vel) / 36)
      const amt = 1.3 + Math.sin(t / 1900) * 0.3 + energy * 3.4
      const px = tx * 2.4
      const py = ty * 1.8

      r.setAttribute('dx', (-amt - px).toFixed(2))
      r.setAttribute('dy', (-py - vel * 0.015).toFixed(2))
      b.setAttribute('dx', (amt + px).toFixed(2))
      b.setAttribute('dy', (py + vel * 0.015).toFixed(2))

      const cx = +(0.75 + energy * 1.7 + Math.abs(tx) * 0.5).toFixed(2)
      const cy = +(ty * 0.6).toFixed(2)
      if (Math.abs(cx - lastX) > 0.02 || Math.abs(cy - lastY) > 0.02) {
        root.style.setProperty('--cx', cx)
        root.style.setProperty('--cy', cy)
        lastX = cx
        lastY = cy
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
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id="ca" x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r0" />
        <feGaussianBlur in="r0" stdDeviation="0.5" result="r1" />
        <feOffset id="ca-r" in="r1" dx="-1.5" dy="0" result="ro" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b0" />
        <feGaussianBlur in="b0" stdDeviation="0.5" result="b1" />
        <feOffset id="ca-b" in="b1" dx="1.5" dy="0" result="bo" />
        <feBlend in="ro" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="bo" mode="screen" />
      </filter>
      <filter id="ca-in" x="-6%" y="-6%" width="112%" height="112%" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r0" />
        <feOffset id="ca-in-r" in="r0" dx="0" dy="0" result="ro" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b0" />
        <feOffset id="ca-in-b" in="b0" dx="0" dy="0" result="bo" />
        <feBlend in="ro" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="bo" mode="screen" />
      </filter>
    </svg>
  )
}
