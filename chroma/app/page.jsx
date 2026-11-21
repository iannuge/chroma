'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import HeroClock from '../components/HeroClock'
import TeeHero from '../components/TeeHero'
import CircleVote from '../components/CircleVote'
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
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  const submit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
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
        required
        aria-label="Cluster title"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
      />
      <button className="pill" disabled={busy || (!!user && (!file || !name.trim()))}>
        {busy ? 'Adding…' : 'Start cluster'}
      </button>
    </form>
  )
}

function ClusterCard({ c, rank }) {
  const router = useRouter()
  const { vote } = useMoodboard()
  const h = hash(c.id)
  const center = c.items[0]
  const ring = c.items.slice(1, 7)
  const bg = (it) =>
    it.img ? { backgroundImage: 'url("' + it.img + '")' } : { backgroundColor: it.color }
  return (
    <div
      data-flip={c.id}
      className={'cw' + (rank ? ' r' + rank : '')}
      style={{
        '--dx': 10 + (h % 13) + 'px',
        '--dy': 8 + (h % 11) + 'px',
        '--dur': 14 + (h % 5) * 3 + 's',
        animationDelay: '-' + (h % 9) + 's',
      }}
    >
      <article
        className="cc"
        tabIndex={0}
        aria-label={c.name}
        onClick={(e) => {
          if (e.target.closest('a')) return
          router.push('/cluster/' + c.id)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') router.push('/cluster/' + c.id)
        }}
      >
        {center && <span className="cen" style={bg(center)} />}
        <div
          className="orb"
          style={{
            '--d': 34 + (h % 4) * 9 + 's',
            animationDirection: h % 2 ? 'reverse' : 'normal',
          }}
        >
          {ring.map((it, k) => (
            <span key={it.id} className="oi" style={{ '--a': (360 / ring.length) * k + 'deg' }}>
              <i
                className="oii"
                style={{ ...bg(it), animationDirection: h % 2 ? 'normal' : 'reverse' }}
              />
            </span>
          ))}
        </div>
        <div className="cap">
          <h3>
            <Link href={'/cluster/' + c.id}>{c.name}</Link>
          </h3>
          <span className="by2">
            by <Link href={'/u/' + c.byId}>{c.by}</Link>
          </span>
          <span className="mu">
            {c.items.length} {c.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </article>
      <div className="vcol">
        <CircleVote dir={1} active={c.mine === 1} onVote={(d) => vote('cluster', c.id, d)} />
        <span className="cs mu" aria-label="Votes">
          {fmtScore(c.score)}
        </span>
        <CircleVote dir={-1} active={c.mine === -1} onVote={(d) => vote('cluster', c.id, d)} />
      </div>
    </div>
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
