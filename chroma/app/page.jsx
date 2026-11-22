'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import HeroClock from '../components/HeroClock'
import TeeHero from '../components/TeeHero'
import VoteBox from '../components/VoteBox'
import Notice from '../components/Notice'
import HowItWorks from '../components/HowItWorks'
import { useMoodboard } from '../components/MoodboardProvider'
import { useAuth } from '../components/AuthProvider'
import { hash, fmtScore } from '../lib/util'
import { shopOpen } from '../lib/shop'
import useFlip from '../lib/useFlip'
import useSift from '../lib/useSift'

const PHASES = ['Moodboard open', 'Design in progress', 'Sold out', 'Approval vote', 'Printing']
const ORDER = ['moodboard', 'design', 'sold_out', 'approval', 'printing']

function NewCluster() {
  const { addCluster, setPrompt } = useMoodboard()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [hint, setHint] = useState('')
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  const submit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!name.trim() || !file) {
      setHint(!name.trim() && !file ? 'Add a title and a first image.' : !name.trim() ? 'Add a title.' : 'Add a first image.')
      return
    }
    setHint('')
    setBusy(true)
    const ok = await addCluster(name.trim(), file)
    setBusy(false)
    if (ok) {
      setName('')
      setFile(null)
      form.reset()
    }
  }

  return (
    <form
      className="nc ncw"
      onSubmit={submit}
      onClickCapture={(e) => {
        if (!user) {
          e.preventDefault()
          e.stopPropagation()
          setPrompt(true)
        }
      }}
    >
      <label
        className="ncp ncc"
        style={preview ? { backgroundImage: 'url("' + preview + '")' } : undefined}
        aria-label="Add a first image"
      >
        {!preview && <span className="plus">+</span>}
        {!preview && <span className="mu">make a cluster</span>}
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
      </label>
      <input
        type="text"
        placeholder="Cluster title"
        aria-label="Cluster title"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
      />
      {hint && (
        <p className="mu" role="status" style={{ margin: 0, fontSize: 13, textAlign: 'center' }}>
          {hint}
        </p>
      )}
      <button className="pill" disabled={busy}>
        {busy ? 'Adding…' : 'Start cluster'}
      </button>
    </form>
  )
}

// Where each floating image rests inside a cluster: [centerX, centerY, size] in % of the card.
const SLOTS = [
  [50, 50, 42],
  [24, 25, 30],
  [77, 24, 29],
  [24, 77, 29],
  [77, 76, 30],
  [50, 14, 22],
  [50, 87, 22],
  [12, 51, 20],
  [88, 50, 20],
]

function ClusterCard({ c, rank }) {
  const router = useRouter()
  const { vote } = useMoodboard()
  const bg = (it) =>
    it.img ? { backgroundImage: 'url("' + it.img + '")' } : { backgroundColor: it.color }
  return (
    <article
      data-flip={c.id}
      className={'cw cd g' + (rank ? ' r' + rank : '')}
      onClick={(e) => {
        if (e.target.closest('button,a')) return
        router.push('/cluster/' + c.id)
      }}
    >
      <div className="ch">
        <div>
          {rank ? <span className="rk">#{rank}</span> : null}
          <h3>
            <Link href={'/cluster/' + c.id}>{c.name}</Link>
          </h3>
          <span className="by2">
            by <Link href={'/u/' + c.byId}>{c.by}</Link>
          </span>
        </div>
        <VoteBox score={c.score} mine={c.mine} onVote={(d) => vote('cluster', c.id, d)} />
      </div>
      <div className="stg">
        {c.items.slice(0, SLOTS.length).map((it, k) => {
          const [x, y, sz] = SLOTS[k]
          const q = hash(it.id)
          return (
            <span
              key={it.id}
              className="fl2"
              style={{
                left: 'calc(' + x + 'cqw - ' + sz / 2 + 'cqw)',
                top: 'calc(' + y + 'cqw - ' + sz / 2 + 'cqw)',
                width: sz + 'cqw',
                height: sz + 'cqw',
                zIndex: k ? 2 : 1,
                '--ix': 1.5 + (q % 5) * 0.5 + 'cqw',
                '--iy': 1.5 + (q % 4) * 0.5 + 'cqw',
                '--ir': (q % 2 ? 1 : -1) * (1 + (q % 2)) + 'deg',
                '--id': 10 + (q % 8) + 's',
                animationDelay: '-' + (q % 11) + 's',
              }}
            >
              <i style={bg(it)} />
            </span>
          )
        })}
      </div>
      <div className="open">
        <span className="mu">
          {c.items.length} {c.items.length === 1 ? 'item' : 'items'}
        </span>
        <b>Open</b>
      </div>
    </article>
  )
}

export default function Home() {
  const { drop, clusters: all, progress, hasOrder, status } = useMoodboard()
  const clusters = all.filter((c) => !c.won)
  const top = clusters.slice(0, 3)
  const rest = clusters.slice(3)
  const topRef = useRef(null)
  const boardRef = useRef(null)
  useFlip(topRef)
  useFlip(boardRef)
  const siftRef = useRef(null)
  useSift(siftRef)

  const idx = !drop ? 0 : drop.status === 'shipped' ? PHASES.length : Math.max(0, ORDER.indexOf(drop.status))
  const goal = progress.goal || 20
  const claimed = progress.claimed || 0
  const pct = Math.min(100, (claimed / goal) * 100)
  const price = drop ? '$' + Math.round(drop.price_cents / 100) : ''

  const chosen = !!drop && drop.status !== 'moodboard'

  const pre = (
    <Link className="pill" href="/preorder">
      {hasOrder ? 'Pre-ordered' : shopOpen && chosen ? 'Pre-order for ' + price : 'Pre-order details, ' + price}
    </Link>
  )

  return (
    <>
      <div className="hero3">
        <TeeHero />
        <div className="h3m">
          <p className="mu">
            [drop {String(drop ? drop.number : 0).padStart(2, '0')}: {drop ? drop.theme : 'genesis'}]
          </p>
          <HeroClock target={drop ? drop.next_iteration_at : null} />
          <p className="mu">until clusters are chosen</p>
          <div className="cta g one">{pre}</div>
        </div>
        <a className="dn mu" href="#board" aria-label="Jump to the moodboard">
          choose a direction ↓
        </a>
      </div>

      <section id="board">
        <div className="w" ref={siftRef}>
          <div className="hd">
            <h2 style={{ margin: 0 }}>choose a direction</h2>
            <p className="mu" style={{ margin: 0 }}>
              the current top three. not the only ones you can vote for, so scroll down for the rest.
            </p>
            <p className="mu" style={{ margin: 0 }}>
              one of these will guide the tee. vote for your favorites, add to other people's clusters, or start your own.
            </p>
          </div>
          <Notice />
          {top.length > 0 && (
            <div className={'top3 n' + top.length} ref={topRef}>
              {top.map((c, i) => (
                <ClusterCard key={c.id} c={c} rank={i + 1} />
              ))}
            </div>
          )}
          {status === 'loading' && <p className="mu">Loading the moodboard…</p>}
          {status === 'ready' && clusters.length === 0 && (
            <p className="mu">No clusters yet. Sign in and start the first one below.</p>
          )}
          <div className="restlabel mu">the rest</div>
          <div className="mb">
            <aside className="mba">
              <NewCluster />
            </aside>
            <div className="board" ref={boardRef}>
              {rest.map((c) => (
                <ClusterCard key={c.id} c={c} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="w">
          <h2>
            crowdsourced art direction
            <br />
            on a graphic tee.
          </h2>
          <HowItWorks />
          <div className="trk g">
            <div className="ph">
              {PHASES.map((p, i) => (
                <div key={p} className={i < idx ? 'on' : i === idx ? 'now' : ''}>
                  <span>{p}</span>
                </div>
              ))}
            </div>
            <div className="row">
              <b>Pre-orders</b>
              <span className="mu">
                {claimed} of {goal} claimed
              </span>
            </div>
            <div
              className="bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pct)}
              aria-label="Pre-orders claimed"
            >
              <i style={{ width: pct + '%' }} />
            </div>
            <div className="row mu">
              <span>Phase 0</span>
              <span>
                {hasOrder
                  ? 'Pre-order bonus on your votes'
                  : chosen
                    ? 'Pre-order to boost your votes'
                    : 'Pre-orders open once a cluster is chosen'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="about">
        <div className="w">
          <h2 style={{ maxWidth: '18ch' }}>Bridging the gap in taste between artist and audience.</h2>
          <div className="g bio">
            <Link href="/" className="sqf" aria-label="back to top of home page">
              <i />
              <i />
              <i />
            </Link>
            <p>
              i am ian, a freelance artist and multidisciplinary creative 🤓. this brand is my passion
              project. peep more of my work at{' '}
              <a href="https://threeletters.net" target="_blank" rel="noopener noreferrer">
                threeletters.net
              </a>
            </p>
            <p className="ai">
              i used ai to make the site but <b>NEVER</b> the t-shirt. i do not support generative artwork!
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
