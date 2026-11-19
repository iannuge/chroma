'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Countdown from '../components/Countdown'
import TeeHero from '../components/TeeHero'
import Tile from '../components/Tile'
import VoteBox from '../components/VoteBox'
import Notice from '../components/Notice'
import { useMoodboard } from '../components/MoodboardProvider'
import { hash } from '../lib/util'

const PHASES = ['Moodboard open', 'Design in progress', 'Sold out', 'Approval vote', 'Printing']
const ORDER = ['moodboard', 'design', 'sold_out', 'approval', 'printing']
// Set this in Vercel (Environment Variables) to your Shopify product or checkout link.
const PREORDER_URL = process.env.NEXT_PUBLIC_PREORDER_URL || ''

function NewCluster() {
  const { addCluster } = useMoodboard()
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
    <form className="nc" onSubmit={submit}>
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
      <button className="pill" disabled={busy || !file}>
        {busy ? 'Adding…' : 'Start cluster'}
      </button>
    </form>
  )
}

export default function Home() {
  const { drop, clusters, progress, hasOrder, status, vote } = useMoodboard()
  const router = useRouter()

  const idx = !drop ? 0 : drop.status === 'shipped' ? PHASES.length : Math.max(0, ORDER.indexOf(drop.status))
  const goal = progress.goal || 100
  const claimed = progress.claimed || 0
  const pct = Math.min(100, (claimed / goal) * 100)
  const price = drop ? '$' + Math.round(drop.price_cents / 100) : ''

  let pre
  if (hasOrder) {
    pre = (
      <button className="pill" disabled>
        Pre-ordered
      </button>
    )
  } else if (PREORDER_URL) {
    pre = (
      <a className="pill" href={PREORDER_URL} target="_blank" rel="noopener noreferrer">
        Pre-order for {price}
      </a>
    )
  } else {
    pre = (
      <button className="pill" disabled>
        Pre-orders open soon
      </button>
    )
  }

  return (
    <>
      <div className="hero w">
        <div className="stage">
          <Countdown target={drop ? drop.next_iteration_at : null} />
          <TeeHero />
          <Link className="pill pv2" href="/iterations">
            Previous iterations
          </Link>
        </div>
        <div className="cta g">
          <span className="mu">
            {drop ? drop.goal : 100} pieces, 280 gsm cotton
          </span>
          {pre}
        </div>
      </div>

      <section>
        <div className="w">
          <h2>DESIGNED BY THOSE WHO WEAR IT</h2>
          <p className="lede">
            <b>Submit</b> images, colors and words to the moodboard, then vote on what stays. The top picks
            shape the tee, with an update every week. <b>Pre-order</b> before the design is final and your
            votes carry more weight, and past buyers get a bonus too.
          </p>
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
            <NewCluster />
          </div>
          <Notice />
          <div className="board">
            {clusters.map((c, r) => {
              const h = hash(c.id)
              return (
                <article
                  key={c.id}
                  className={'cl g' + (r < 5 ? ' k' + r : '')}
                  style={{
                    '--r': (h % 2 ? 0.6 : -0.6) + 'deg',
                    '--dur': 6 + (h % 3) * 1.5 + 's',
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
          <h2 style={{ maxWidth: '18ch' }}>Bridging the gap in taste between an artist and their audience.</h2>
          <div className="g bio">
            <p>
              i am ian, a freelance artist and multidisciplinary creative 🤓. this brand is my passion
              project. peep more of my work at{' '}
              <a href="https://threeletters.net" target="_blank" rel="noopener noreferrer">
                threeletters.net
              </a>
            </p>
            <p className="ai">
              i used ai to make the site but <b>NOT</b> the t-shirt. i do not support generative artwork!
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
