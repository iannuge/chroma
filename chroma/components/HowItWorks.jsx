'use client'

import { useEffect, useState } from 'react'

export default function HowItWorks() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const key = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', key)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', key)
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      <button className="hiwb g" onClick={() => setOpen(true)} aria-haspopup="dialog">
        how it works <b>+</b>
      </button>
      {open && (
        <div className="lb apl" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="How it works">
          <div className="ap wide g" onClick={(e) => e.stopPropagation()}>
            <h3>how it works</h3>
            <ol className="hiw">
              <li>
                <b>Submit.</b> Start a cluster of images around a theme, or add to someone else&apos;s.
                Every image you submit adds 1% to the weight of your votes.
              </li>
              <li>
                <b>Vote.</b> Upvote and downvote clusters and images, and leave comments. The top three are
                shown biggest, but every cluster on the board can be voted on.
              </li>
              <li>
                <b>One becomes the tee.</b> When the countdown ends, the top cluster is locked in as the next
                shirt. The rest stay on the board for the next drop.
              </li>
              <li>
                <b>Revise.</b> I post a draft, you give feedback, and the design is revised before it goes to
                print.
              </li>
              <li>
                <b>Pre-order.</b> Each drop is limited. Pre-orderers&apos; votes count more, and once a drop is
                claimed, buyers approve the final design.
              </li>
            </ol>
            <p className="gift">
              <b>The person behind the winning cluster receives a free shirt.</b>
            </p>
            <div className="row2">
              <button className="pill" onClick={() => setOpen(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
