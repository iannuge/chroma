'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { caReveal } from '../lib/caReveal'

// Wraps the page content. On navigation (not first load) the new page starts split and snaps clean.
export default function PageReveal({ children }) {
  const path = usePathname()
  const first = useRef(true)
  const el = useRef(null)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    return caReveal(el.current, { ms: 750, amount: 12 })
  }, [path])

  return <div ref={el}>{children}</div>
}
