'use client'

import Link from 'next/link'
import { useState } from 'react'
import TeeHero from '../../components/TeeHero'
import { useMoodboard } from '../../components/MoodboardProvider'
import { SIZES, MAX_QTY, shopOpen, needsSize } from '../../lib/shop'

const pad = (n) => String(n).padStart(2, '0')

export default function PreOrder() {
  const { drop, progress, hasOrder } = useMoodboard()
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [pw, setPw] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const call = async (extra) => {
    const r = await fetch('/api/preorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw, ...extra }),
    })
    return r.json().catch(() => ({ ok: false, error: 'Something went wrong.' }))
  }
  const unlock = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const r = await call({})
    setBusy(false)
    if (r.ok) setUnlocked(true)
    else setMsg(r.error || 'Wrong password.')
  }
  const checkout = async () => {
    setBusy(true)
    setMsg('')
    const r = await call({ size, qty })
    if (r.ok && r.url) window.location.href = r.url
    else {
      setBusy(false)
      setMsg(r.error || 'Something went wrong.')
    }
  }

  const goal = progress.goal || (drop && drop.goal) || 20
  const claimed = progress.claimed || 0
  const soldOut = claimed >= goal
  const pct = Math.min(100, (claimed / goal) * 100)
  const price = drop && drop.price_cents ? '$' + Math.round(drop.price_cents / 100) : ''
  const chosen = unlocked

  let action
  if (hasOrder) {
    action = (
      <button className="pill" disabled>
        you&apos;ve pre-ordered this drop
      </button>
    )
  } else if (soldOut) {
    action = (
      <button className="pill" disabled>
        sold out
      </button>
    )
  } else if (!chosen) {
    action = (
      <button className="pill" disabled>
        early access only
      </button>
    )
  } else if (!shopOpen) {
    action = (
      <button className="pill" disabled>
        pre-orders open soon
      </button>
    )
  } else if (needsSize && !size) {
    action = (
      <button className="pill" disabled>
        choose a size
      </button>
    )
  } else {
    action = (
      <button className="pill" onClick={checkout} disabled={busy}>
        {busy ? 'opening checkout…' : 'pre-order ' + (qty > 1 ? qty + ' × ' : '') + 'size ' + size + (price && qty > 1 ? ', $' + qty * Math.round(drop.price_cents / 100) : price ? ', ' + price : '')}
      </button>
    )
  }

  return (
    <main className="w page po">
      <Link className="bk g" href="/">
        Back home
      </Link>

      <div className="cvh">
        <h1>Pre-order</h1>
        <p className="mu">
          [drop {pad(drop ? drop.number : 0)}: {drop ? drop.theme : 'genesis'}]
        </p>
      </div>

      <div className="pob">
        <div className="pot">
          <TeeHero />
        </div>

        <div className="g pop">
          <div className="pop-price">
            <b>{price}</b>
            <span className="mu">limited run of {goal}</span>
          </div>

          <div className="trk-mini">
            <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
              <i style={{ width: pct + '%' }} />
            </div>
            <span className="mu">
              {claimed} of {goal} claimed
            </span>
          </div>

          <div className="sz" role="radiogroup" aria-label="Size">
            {SIZES.map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={size === s}
                className={'szb' + (size === s ? ' on' : '')}
                onClick={() => setSize(s)}
                disabled={!chosen}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="qty" aria-label="Quantity">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={!chosen || qty <= 1} aria-label="Fewer">
              −
            </button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} disabled={!chosen || qty >= MAX_QTY} aria-label="More">
              +
            </button>
            <span className="mu">quantity (one size per order)</span>
          </div>

          {action}
          {msg && <p className="mu">{msg}</p>}
          {!unlocked && (
            <form onSubmit={unlock} className="pwf">
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="early access password"
                aria-label="Early access password"
                autoComplete="off"
              />
              <button className="pill" type="submit" disabled={busy || !pw}>
                unlock
              </button>
            </form>
          )}

          <ul className="facts mu">
            <li>ships to the united states only</li>
            <li>cancel and refund anytime before production, by replying to your confirmation email</li>
            <li>secure checkout through shopify</li>
          </ul>
        </div>
      </div>

      <div className="pocs">
        <section className="g poc">
          <h2>about this drop</h2>
          <p>
            You&apos;re pre-ordering a shirt before its design is final. The community picks the idea, I design
            the tee from it, and you can give feedback on the draft. Once all {goal} are claimed, buyers vote
            to approve the final design before it goes to print. Pre-orderers&apos; votes count more. Sign in
            with the same email you check out with so your order is matched to your account.
          </p>
          <p>
            I&apos;m not planning to make any money off this drop. I just want to get some work out there.
          </p>
        </section>

        <p className="mu pof">
          Questions? Reach out through{' '}
          <a href="https://threeletters.net" target="_blank" rel="noopener noreferrer">
            threeletters.net
          </a>{' '}
          or on instagram,{' '}
          <a href="https://instagram.com/iannuge" target="_blank" rel="noopener noreferrer">
            @iannuge
          </a>
          .
        </p>
      </div>
    </main>
  )
}
