'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { lum } from '../lib/util'

export default function Lightbox({ item, onClose }) {
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
      </div>
    </div>
  )
}
