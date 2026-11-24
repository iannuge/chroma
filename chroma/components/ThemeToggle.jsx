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
    <div className="thm">
      <button type="button" className={'thl' + (light ? '' : ' on')} onClick={() => set(false)}>
        dark
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={light}
        aria-label="Light mode"
        className={'sw' + (light ? ' on' : '')}
        onClick={() => set(!light)}
      >
        <i />
      </button>
      <button type="button" className={'thl' + (light ? ' on' : '')} onClick={() => set(true)}>
        light
      </button>
    </div>
  )
}
