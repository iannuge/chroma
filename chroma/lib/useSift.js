import { useEffect } from 'react'

// Hover a cluster and the others ease away while it grows a little, so you sift through the ideas.
export default function useSift(ref) {
  useEffect(() => {
    const root = ref.current
    if (!root || !window.matchMedia('(hover:hover)').matches) return
    const RANGE = 560
    const PUSH = 90

    const reset = () => {
      root.querySelectorAll('.cw').forEach((el) => {
        el.style.removeProperty('--px')
        el.style.removeProperty('--py')
        el.style.removeProperty('--sc')
      })
    }
    const over = (e) => {
      const hov = e.target.closest ? e.target.closest('.cw') : null
      if (!hov || !root.contains(hov)) return reset()
      const hr = hov.getBoundingClientRect()
      const hx = hr.left + hr.width / 2
      const hy = hr.top + hr.height / 2
      root.querySelectorAll('.cw').forEach((el) => {
        if (el === hov) {
          el.style.setProperty('--sc', '1.08')
          el.style.removeProperty('--px')
          el.style.removeProperty('--py')
          return
        }
        const r = el.getBoundingClientRect()
        const dx = r.left + r.width / 2 - hx
        const dy = r.top + r.height / 2 - hy
        const d = Math.hypot(dx, dy) || 1
        const k = Math.max(0, 1 - d / RANGE) * PUSH
        el.style.setProperty('--px', (dx / d) * k + 'px')
        el.style.setProperty('--py', (dy / d) * k + 'px')
        el.style.removeProperty('--sc')
      })
    }
    root.addEventListener('pointerover', over)
    root.addEventListener('pointerleave', reset)
    return () => {
      root.removeEventListener('pointerover', over)
      root.removeEventListener('pointerleave', reset)
      reset()
    }
  }, [ref])
}
