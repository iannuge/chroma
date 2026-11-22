'use client'

import { fmtScore } from '../lib/util'

export default function VoteBox({ score, mine, onVote }) {
  const click = (d) => (e) => {
    e.stopPropagation()
    onVote(d)
  }
  return (
    <div className="v">
      <button className={mine === 1 ? 'on' : ''} data-d="up" aria-label="Upvote" aria-pressed={mine === 1} onClick={click(1)} />
      <b>{fmtScore(score)}</b>
      <button className={mine === -1 ? 'on' : ''} data-d="down" aria-label="Downvote" aria-pressed={mine === -1} onClick={click(-1)} />
    </div>
  )
}
