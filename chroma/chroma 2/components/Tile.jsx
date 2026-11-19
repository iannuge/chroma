'use client'

import Link from 'next/link'
import VoteBox from './VoteBox'
import { lum } from '../lib/util'

export default function Tile({ item, onVote, size, hideBy }) {
  const style = item.img
    ? {
        backgroundImage: 'linear-gradient(transparent 55%,rgba(0,0,0,.6)),url("' + item.img + '")',
        color: '#fff',
      }
    : { backgroundColor: item.color, color: lum(item.color) > 0.55 ? '#000' : '#fff' }
  if (size) style.fontSize = size

  return (
    <div className="it" style={style}>
      <span>
        {item.caption}
        {!hideBy && item.byId ? (
          <Link className="by" href={'/u/' + item.byId}>
            {item.by}
          </Link>
        ) : null}
      </span>
      {onVote && <VoteBox score={item.score} mine={item.mine} onVote={onVote} />}
    </div>
  )
}
