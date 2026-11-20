'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import HeroClock from '../components/HeroClock'
import TeeHero from '../components/TeeHero'
import Tile from '../components/Tile'
import VoteBox from '../components/VoteBox'
import Notice from '../components/Notice'
import HowItWorks from '../components/HowItWorks'
import { useMoodboard } from '../components/MoodboardProvider'
import { useAuth } from '../components/AuthProvider'
import { hash } from '../lib/util'
import { shopOpen } from '../lib/shop'
import useFlip from '../lib/useFlip'
import { HAS_ITERATIONS } from '../lib/data'

const PHASES = ['Moodboard open', 'Design in progress', 'Sold out', 'Approval vote', 'Printing']
const ORDER = ['moodboard', 'design', 'sold_out', 'approval', 'printing']

function NewCluster() {
  const { addCluster, setPrompt } = useMoodboard()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)

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
      className="nc"
      onSubmit={submit}
      onClickCapture={(e) => {
        if (!user) {
          e.preventDefault()
          e.stopPropagation()
          setPrompt(true)
        }
      }}
    >
      <input
        type="text"
        placeholder="New cluster name"
        required
        aria-label="New cluster name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
      />
      <label className="im">
        {file ? 'Image ✓' : 'First image'}
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
      </label>
      <button className="pill" disabled={busy || (!!user && !file)}>
        {busy ? 'Adding…' : 'Start cluster'}
      </button>
    </form>
  )
}

export default function Home() {
  const { drop, clusters: all, progress, hasOrder, status, vote } = useMoodboard()
  const clusters = all.filter((c) => !c.won)
  const router = useRouter()
  const boardRef = useRef(null)
  useFlip(boardRef)

  const idx = !drop ? 0 : drop.status === 'shipped' ? PHASES.length : Math.max(0, ORDER.indexOf(drop.status))
  const goal = progress.goal || 20
  const claimed = progress.claimed || 0
  const pct = Math.min(100, (claimed / goal) * 100)
  const price = drop ? '$' + Math.round(drop.price_cents / 100) : ''

  const pre = (
    <Link className="pill" href="/preorder">
      {hasOrder ? 'Pre-ordered' : shopOpen ? 'Pre-order for ' + price : 'Pre-order details'}
    </Link>
  )

  return (
    <>
      <div className="hero2">
        <div className="hl">
          <p>
            [drop {String(drop ? drop.number : 0).padStart(2, '0')}: {drop ? drop.theme : 'genesis'}]
          </p>
          <HeroClock target={drop ? drop.next_iteration_at : null} />
          <p className="sub2">until clusters are chosen</p>
        </div>
        <div className="hteewrap">
          <TeeHero />
          {HAS_ITERATIONS ? (
            <Link className="pill pv2" href="/iterations">
              Previous iterations
            </Link>
          ) : (
            <button className="pill pv2 off" disabled title="No previous iterations yet">
              Previous iterations
            </button>
          )}
        </div>
        <div className="w">
          <div className="cta g one">{pre}</div>
        </div>
      </div>

      <section>
        <div className="w">
          <h2 style={{ maxWidth: '20ch' }}>CROWDSOURCED ART DIRECTION ON A GRAPHIC TEE.</h2>
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
              <span>Week 2 of 4</span>
              <span>{hasOrder ? 'Pre-order bonus on your votes' : 'Pre-order to boost your votes'}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="board">
        <div className="w">
          <div className="hd">
            <h2 style={{ margin: 0 }}>The moodboard</h2>
            <p className="mu" style={{ margin: 0 }}>
              these are just placeholder images right now. but its all functional! try uploading something
            </p>
            <NewCluster />
          </div>
          <Notice />
          <div className="board" ref={boardRef}>
            {clusters.map((c, r) => {
              const h = hash(c.id)
              return (
                <article
                  key={c.id}
                  data-flip={c.id}
                  className={'cl g' + (r < 5 ? ' k' + r : '')}
                  style={{
                    '--r': (h % 2 ? 0.6 : -0.6) + 'deg',
                    '--dur': 11 + (h % 3) * 2.5 + 's',
                    animationDelay: '-' + (h % 7) + 's',
                  }}
                  onClick={(e) => {
                    if (e.target.closest('button,a')) return
                    router.push('/cluster/' + c.id)
                  }}
                >
                  <div className="ch">
                    <div>
                      <h3>
                        <Link href={'/cluster/' + c.id}>{c.name}</Link>
                      </h3>
                      <span className="by2">
                        by <Link href={'/u/' + c.byId}>{c.by}</Link>
                      </span>
                    </div>
                    <VoteBox score={c.score} mine={c.mine} onVote={(d) => vote('cluster', c.id, d)} />
                  </div>
                  <div className="pv">
                    {c.items.slice(0, 3).map((it) => (
                      <Tile key={it.id} item={it} />
                    ))}
                  </div>
                  <div className="open">
                    <span className="mu">
                      {c.items.length} {c.items.length === 1 ? 'item' : 'items'}
                    </span>
                    <b>Open</b>
                  </div>
                </article>
              )
            })}
          </div>
          {status === 'loading' && <p className="mu">Loading the moodboard…</p>}
          {status === 'ready' && clusters.length === 0 && (
            <p className="mu">No clusters yet. Sign in and start the first one above.</p>
          )}
        </div>
      </section>

      <section id="about">
        <div className="w">
          <h2 style={{ maxWidth: '18ch' }}>Bridging the gap in taste between artist and audience.</h2>
          <div className="g bio">
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
