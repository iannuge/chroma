'use client'

import { useEffect, useState } from 'react'

// dark is the default; the choice is remembered in this browser only.
export default function ThemeToggle() {
  const [light, setLight] = useState(false)

  useEffect(() => {
    setLight(document.documentElement.getAttribute('data-theme') === 'light')
  }, [])

  const set = (next) => {
    setLight(next)
    const root = document.documentElement
    if (next) root.setAttribute('data-theme', 'light')
    else root.removeAttribute('data-theme')
    try {
      localStorage.setItem('chroma-theme', next ? 'light' : 'dark')
    } catch (e) {}
  }

  return (
    <button className="thm" onClick={() => set(!light)} aria-label={light ? 'Switch to dark' : 'Switch to light'}>
      <span className={light ? '' : 'on'}>dark</span>
      <i>/</i>
      <span className={light ? 'on' : ''}>light</span>
    </button>
  )
}
