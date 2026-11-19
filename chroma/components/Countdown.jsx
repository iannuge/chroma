'use client'

import { useEffect, useState } from 'react'

const WEEK = 7 * 24 * 60 * 60 * 1000

function nextMonday() {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + ((1 - d.getDay() + 7) % 7))
  return d.getTime()
}

function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const x = s % 60
  const q = (n) => String(n).padStart(2, '0')
  return (d ? d + 'd ' : '') + q(h) + ':' + q(m) + ':' + q(x)
}

export default function Countdown({ target }) {
  const [text, setText] = useState('0:00')

  useEffect(() => {
    const tick = () => {
      let end = target ? new Date(target).getTime() : nextMonday()
      while (end <= Date.now()) end += WEEK
      setText(fmt(end - Date.now()))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])

  return (
    <div className="cdw g">
      <span>next iteration in</span> <b>{text}</b>
    </div>
  )
}
