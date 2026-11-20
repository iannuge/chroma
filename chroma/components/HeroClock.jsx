'use client'

import { useEffect, useState } from 'react'

const q = (n) => String(n).padStart(2, '0')

function parts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return [q(Math.floor(s / 86400)), q(Math.floor((s % 86400) / 3600)), q(Math.floor((s % 3600) / 60)), q(s % 60)]
}

// Big countdown: days : hours : minutes : seconds, just the numbers.
export default function HeroClock({ target }) {
  const [p, setP] = useState(null)

  useEffect(() => {
    if (!target) {
      setP(null)
      return
    }
    const end = new Date(target).getTime()
    const tick = () => setP(parts(end - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])

  const v = p || ['--', '--', '--', '--']
  return (
    <h1 aria-label="Time until clusters are chosen">
      {v.map((x, i) => (
        <span key={i}>
          {i > 0 && <span className="cl">:</span>}
          {x}
        </span>
      ))}
    </h1>
  )
}
