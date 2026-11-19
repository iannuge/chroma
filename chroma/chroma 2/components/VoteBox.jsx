'use client'

import { fmtScore } from '../lib/util'

export default function VoteBox({ score, mine, onVote }) {
  const click = (d) => (e) => {
    e.stopPropagation()
    onVote(d)
  }
  return (
    <div className="v">
      <button className={mine === 1 ? 'on' : ''} aria-label="Upvote" onClick={click(1)}>
        ▲
      </button>
      <b>{fmtScore(score)}</b>
      <button className={mine === -1 ? 'on' : ''} aria-label="Downvote" onClick={click(-1)}>
        ▼
      </button>
    </div>
  )
}
