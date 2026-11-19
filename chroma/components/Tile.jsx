'use client'

import VoteBox from './VoteBox'
import { lum } from '../lib/util'

export default function Tile({ item, onVote, size }) {
  const style = item.img
    ? {
        backgroundImage: 'linear-gradient(transparent 40%,rgba(0,0,0,.65)),url("' + item.img + '")',
        color: '#fff',
      }
    : { backgroundColor: item.color, color: lum(item.color) > 0.55 ? '#000' : '#fff' }
  if (size) style.fontSize = size

  return (
    <div className="it" style={style}>
      <span>
        {item.caption}
        <small className="by">{item.by}</small>
      </span>
      {onVote && <VoteBox score={item.score} mine={item.mine} onVote={onVote} />}
    </div>
  )
}
