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
                <b>Submit.</b> Start a cluster of images, colors and ideas around a theme, or add images to
                someone else&apos;s. The moodboard is open to everyone with an account.
              </li>
              <li>
                <b>Vote.</b> Upvote or downvote clusters and the images inside them. The most upvoted
                clusters and images float higher and grow larger.
              </li>
              <li>
                <b>The winner becomes the tee.</b> After two weeks, the top cluster is locked in as the next
                shirt. Its theme and its most upvoted images shape the design. Every other cluster stays on
                the board for the next drop.
              </li>
              <li>
                <b>Revise and iterate.</b> Choosing a cluster isn&apos;t the end. Once it wins, I post a
                draft of the design and the community can weigh in with feedback. The design gets revised
                and iterated on before it&apos;s finalized and sent to print.
              </li>
              <li>
                <b>Pre-order early.</b> You can pre-order before the design is final, and pre-orderers&apos;
                votes carry more weight.
              </li>
              <li>
                <b>A limited run.</b> Each drop is a set number of pieces. Once they&apos;re claimed, buyers
                get a final vote to approve the design before it goes to print.
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
