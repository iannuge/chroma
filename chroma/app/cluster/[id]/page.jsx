'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import VoteBox from '../../../components/VoteBox'
import Notice from '../../../components/Notice'
import Lightbox from '../../../components/Lightbox'
import { useMoodboard } from '../../../components/MoodboardProvider'
import { useAuth } from '../../../components/AuthProvider'
import Comments from '../../../components/Comments'
import { lum } from '../../../lib/util'

function AddItem({ clusterId, clusterName }) {
  const { addItem, setPrompt } = useMoodboard()
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

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
      className="nc g addc"
      onSubmit={submit}
      onClickCapture={(e) => {
        if (!user) {
          e.preventDefault()
          e.stopPropagation()
          setPrompt(true)
        }
      }}
    >
      <span className="ncl mu">add to {clusterName}</span>
      <label
        className="ncp"
        style={preview ? { backgroundImage: 'url("' + preview + '")' } : undefined}
        aria-label={'Add an image to ' + clusterName}
      >
        {!preview && <span className="plus">+</span>}
        {!preview && <span className="mu">add an image</span>}
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
      </label>
      <button className="pill" disabled={busy || (!!user && !file)}>
        {busy ? 'Adding…' : 'Add image'}
      </button>
    </form>
  )
}

export default function ClusterPage() {
  const params = useParams()
  const id = params ? params.id : null
  const { clusters, status, vote } = useMoodboard()
  const cluster = clusters.find((c) => c.id === id)
  const [openId, setOpenId] = useState(null)
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

  return (
    <main className="w page">
      <Link className="bk g" href="/#board">
        Back to moodboard
      </Link>
      <div className="cvh">
        <h1>{cluster.name}</h1>
        <span className="mu">
          started by <Link href={'/u/' + cluster.byId}>{cluster.by}</Link> · {items.length}{' '}
          {items.length === 1 ? 'item' : 'items'}
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
      <div className="mas">
        {items.map((it) => (
          <figure
            key={it.id}
            className={'mi' + (it.img ? '' : ' flat')}
            style={it.img ? undefined : { backgroundColor: it.color, color: lum(it.color) > 0.55 ? '#000' : '#fff' }}
            onClick={(e) => {
              if (e.target.closest('button,a')) return
              setOpenId(it.id)
            }}
          >
            {it.img ? <img src={it.img} alt={it.caption || 'moodboard image'} loading="lazy" /> : <span className="mic">{it.caption}</span>}
            <figcaption className="mib">
              <Link className="by" href={'/u/' + it.byId}>
                {it.by}
              </Link>
              {!cluster.won && <VoteBox score={it.score} mine={it.mine} onVote={(d) => vote('item', it.id, d)} />}
            </figcaption>
          </figure>
        ))}
      </div>
      {!cluster.won && <AddItem clusterId={cluster.id} clusterName={cluster.name} />}
      <p className="mu">
        {cluster.won
          ? 'This cluster won, so voting and uploads are closed. Click an image to expand it.'
          : 'Click an image to expand it.'}
      </p>
      <Comments kind="cluster" id={cluster.id} />
      <Lightbox item={items.find((i) => i.id === openId) || null} onClose={() => setOpenId(null)} />
    </main>
  )
}
