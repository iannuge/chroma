'use client'

// A small round vote button: black until you vote, white once you have.
export default function CircleVote({ dir, active, onVote }) {
  return (
    <button
      type="button"
      className={'cv' + (active ? ' on' : '')}
      aria-label={dir > 0 ? 'Upvote' : 'Downvote'}
      aria-pressed={!!active}
      onClick={(e) => {
        e.stopPropagation()
        onVote(dir)
      }}
    >
      {dir > 0 ? '▲' : '▼'}
    </button>
  )
}
