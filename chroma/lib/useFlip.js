'use client'

import { useLayoutEffect, useRef } from 'react'

// Slides elements to their new spot when the order changes, instead of jumping.
// Mark each movable child with data-flip="<unique id>". The container must be position: relative.
export default function useFlip(containerRef, duration = 900) {
  const prev = useRef(new Map())

  useLayoutEffect(() => {
    const root = containerRef.current
    if (!root) return
    const calm =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const next = new Map()
    root.querySelectorAll('[data-flip]').forEach((el) => {
      const id = el.getAttribute('data-flip')
      const x = el.offsetLeft
      const y = el.offsetTop
      next.set(id, { x, y })
      const p = prev.current.get(id)
      if (p && !calm && el.animate && (Math.abs(p.x - x) > 1 || Math.abs(p.y - y) > 1)) {
        el.animate(
          [{ translate: p.x - x + 'px ' + (p.y - y) + 'px' }, { translate: '0px 0px' }],
          { duration, easing: 'cubic-bezier(.22,.8,.22,1)' }
        )
      }
    })
    prev.current = next
  })
}
