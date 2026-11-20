'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useMoodboard } from './MoodboardProvider'
import { useAuth } from './AuthProvider'
import { lum } from '../lib/util'

const REASONS = ['copyright', 'inappropriate', 'ai-generated', 'spam', 'other']

export default function Lightbox({ item, onClose }) {
  const { reportItem } = useMoodboard()
  const { user } = useAuth()
  const [asking, setAsking] = useState(false)
  const [reason, setReason] = useState(REASONS[0])
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const id = item ? item.id : null
  useEffect(() => {
    setAsking(false)
    setNote('')
    setReason(REASONS[0])
  }, [id])

  const send = async () => {
    setBusy(true)
    const r = await reportItem(item.id, reason)
    setBusy(false)
    if (r.ok) {
      setNote('Reported. Thank you.')
      setAsking(false)
      setTimeout(onClose, 1400)
    } else {
      setNote(r.error)
    }
  }

  useEffect(() => {
    if (!item) return
    const key = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', key)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', key)
      document.body.style.overflow = prev
    }
  }, [item, onClose])

  if (!item) return null

  return (
    <div className="lb" onClick={onClose} role="dialog" aria-modal="true" aria-label="Expanded image">
      <button className="lbx pill" onClick={onClose} aria-label="Close">
        Close
      </button>
      <div className="lbc" onClick={(e) => e.stopPropagation()}>
        {item.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.img} alt={item.caption || 'Moodboard image'} />
        ) : (
          <div
            className="lbt"
            style={{ backgroundColor: item.color, color: lum(item.color) > 0.55 ? '#000' : '#fff' }}
          >
            {item.caption}
          </div>
        )}
        <div className="lbm g">
          <span>
            {item.img && item.caption ? item.caption + ' · ' : ''}
            by{' '}
            {item.byId ? (
              <Link href={'/u/' + item.byId} onClick={onClose}>
                {item.by}
              </Link>
            ) : (
              item.by
            )}
          </span>
          <b>{item.score > 0 ? '+' + item.score : item.score}</b>
        </div>
        {!(user && item.byId === user.id) && (
          <div className="lbr g">
            {asking ? (
              <>
                <select value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Reason">
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button className="pill" onClick={send} disabled={busy}>
                  {busy ? 'Sending…' : 'Send report'}
                </button>
                <button onClick={() => setAsking(false)}>Cancel</button>
              </>
            ) : (
              <button onClick={() => (user ? setAsking(true) : reportItem(item.id, null))}>Report</button>
            )}
            {note && <span className="mu">{note}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
