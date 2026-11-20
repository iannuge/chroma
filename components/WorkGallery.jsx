'use client'

import { useCallback, useEffect, useState } from 'react'
import { WORK } from '../lib/data'

export default function WorkGallery() {
  const [i, setI] = useState(null)
  const n = WORK.length
  const item = i == null ? null : WORK[i]

  const close = useCallback(() => setI(null), [])
  const step = useCallback((d) => setI((c) => (c == null ? c : (c + d + n) % n)), [n])

  useEffect(() => {
    if (i == null) return
    const key = (e) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', key)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', key)
      document.body.style.overflow = prev
    }
  }, [i, close, step])

  return (
    <>
      <div className="wk">
        {WORK.map((x, k) => (
          <button key={x.src} className="wkt g" onClick={() => setI(k)} aria-label={'Open ' + x.title}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={x.src} alt={x.title} loading="lazy" />
          </button>
        ))}
      </div>

      {item && (
        <div className="lb wv" onClick={close} role="dialog" aria-modal="true" aria-label={item.title}>
          <button className="lbx pill" onClick={close} aria-label="Close">
            Close
          </button>
          <div className="wvc" onClick={(e) => e.stopPropagation()}>
            <div className="wvi g">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt={item.title} />
            </div>
            <div className="wvt g">
              <span className="mu">
                {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
              </span>
              <h3>{item.title}</h3>
              {item.year ? <p className="wvy mu">{item.year}</p> : null}
              {item.desc ? <p className="wvd">{item.desc}</p> : null}
              <div className="wvn">
                <button className="pill ghost" onClick={() => step(-1)} aria-label="Previous">
                  Prev
                </button>
                <button className="pill ghost" onClick={() => step(1)} aria-label="Next">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
