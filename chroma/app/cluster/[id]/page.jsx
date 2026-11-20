'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Tile from '../../../components/Tile'
import VoteBox from '../../../components/VoteBox'
import Notice from '../../../components/Notice'
import Lightbox from '../../../components/Lightbox'
import { useMoodboard } from '../../../components/MoodboardProvider'
import { useAuth } from '../../../components/AuthProvider'

function AddItem({ clusterId }) {
  const { addItem, setPrompt } = useMoodboard()
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    setBusy(true)
    const ok = await addItem(clusterId, file)
    setBusy(false)
    if (ok) {
      setFile(null)
      form.reset()
    }
  }

  return (
    <form
      className="add g"
      onSubmit={submit}
      onClickCapture={(e) => {
        if (!user) {
          e.preventDefault()
          e.stopPropagation()
          setPrompt(true)
        }
      }}
    >
      <label className="im">
        {file ? 'Image ✓' : 'Choose an image'}
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
      </label>
      <button disabled={busy || (!!user && !file)}>{busy ? 'Adding…' : 'Add image'}</button>
    </form>
  )
}

export default function ClusterPage() {
  const params = useParams()
  const id = params ? params.id : null
  const { clusters, status, vote } = useMoodboard()
  const cluster = clusters.find((c) => c.id === id)
  const found = !!cluster

  const stage = useRef(null)
  const [dim, setDim] = useState({ w: 0, h: 0 })
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    const el = stage.current
    if (!el) return
    const measure = () => setDim({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [found])

  if (!cluster) {
    return (
      <main className="w page">
        <Link className="bk g" href="/#board">
          Back to moodboard
        </Link>
        <p className="mu">{status === 'loading' ? 'Loading…' : 'That cluster could not be found.'}</p>
      </main>
    )
  }

  const items = cluster.items
  const scores = items.map((i) => i.score)
  const mx = scores.length ? Math.max(...scores) : 0
  const mn = scores.length ? Math.min(...scores) : 0
  // Staggered grid: big enough to read at 0-1 votes, with score only nudging size and position.
  const W = dim.w || 600
  const cols = W < 520 ? 2 : W < 900 ? 3 : 4
  const gap = 18
  const cell = (W - gap * (cols - 1)) / cols
  const rowH = cell * 0.92
  const rows = Math.max(1, Math.ceil(items.length / cols))
  const stageH = rows * rowH + (cols > 1 ? rowH * 0.25 : 0) + 24

  return (
    <main className="w page">
      <Link className="bk g" href="/#board">
        Back to moodboard
      </Link>
      <div className="cvh">
        <h1>{cluster.name}</h1>
        <span className="mu">
          started by <Link href={'/u/' + cluster.byId}>{cluster.by}</Link>
        </span>
        {cluster.won ? (
          <span className="badge">
            became drop {String(cluster.wonNumber == null ? 0 : cluster.wonNumber).padStart(2, '0')}
          </span>
        ) : (
          <VoteBox score={cluster.score} mine={cluster.mine} onVote={(d) => vote('cluster', cluster.id, d)} />
        )}
      </div>
      <Notice />
      <div className="fs" ref={stage} style={{ height: stageH }}>
        {items.map((it, k) => {
          const n = mx === mn ? 0.5 : (it.score - mn) / (mx - mn)
          const z = cell * (0.86 + n * 0.14)
          const h = z * 0.9
          const col = k % cols
          const row = Math.floor(k / cols)
          const left = col * (cell + gap) + (cell - z) / 2
          const top = row * rowH + (col % 2 ? rowH * 0.22 : 0) + (rowH - h) / 2 * 0.4 + 8
          const fs = 13 + n * 8
          return (
            <div
              className="fi"
              key={it.id}
              style={{ width: z, height: h, left, top, zIndex: 100 - k }}
            >
              <div
                className="fl"
                style={{
                  '--r': (k % 2 ? 1.2 : -1.2) + 'deg',
                  '--dur': 9 + (k % 4) * 2 + 's',
                  animationDelay: '-' + k + 's',
                }}
              >
                <Tile item={it} size={fs} onOpen={(x) => setOpenId(x.id)} onVote={cluster.won ? undefined : (d) => vote('item', it.id, d)} />
              </div>
            </div>
          )
        })}
      </div>
      {!cluster.won && <AddItem clusterId={cluster.id} />}
      <p className="mu">{cluster.won
          ? 'This cluster won, so voting and uploads are closed. Click an image to expand it.'
          : 'Higher scores float higher and grow larger. Click an image to expand it.'}</p>
      <Lightbox item={items.find((i) => i.id === openId) || null} onClose={() => setOpenId(null)} />
    </main>
  )
}
