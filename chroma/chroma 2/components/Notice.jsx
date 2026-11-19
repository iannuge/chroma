'use client'

import { useMoodboard } from './MoodboardProvider'

export default function Notice() {
  const { msg, setMsg } = useMoodboard()
  if (!msg) return null
  return (
    <p className="note g" role="status" onClick={() => setMsg('')} title="Click to dismiss">
      {msg}
    </p>
  )
}
