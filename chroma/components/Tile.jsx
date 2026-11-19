'use client'

import Link from 'next/link'
import VoteBox from './VoteBox'
import { lum } from '../lib/util'

export default function Tile({ item, onVote, size, hideBy, onOpen }) {
  const style = item.img
    ? {
        backgroundImage: 'linear-gradient(transparent 55%,rgba(0,0,0,.6)),url("' + item.img + '")',
        color: '#fff',
      }
    : { backgroundColor: item.color, color: lum(item.color) > 0.55 ? '#000' : '#fff' }
  if (size) style.fontSize = size
  if (onOpen) style.cursor = 'zoom-in'

  return (
    <div
      className="it"
      style={style}
      onClick={
        onOpen
          ? (e) => {
              if (e.target.closest('button,a')) return
              onOpen(item)
            }
          : undefined
      }
    >
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
