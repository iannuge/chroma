'use client'

import Link from 'next/link'
import { useState } from 'react'
import TeeHero from '../../components/TeeHero'
import { useMoodboard } from '../../components/MoodboardProvider'
import { SIZES, shopOpen, needsSize, checkoutUrl } from '../../lib/shop'

const pad = (n) => String(n).padStart(2, '0')

export default function PreOrder() {
  const { drop, progress, hasOrder } = useMoodboard()
  const [size, setSize] = useState('')

  const goal = progress.goal || (drop && drop.goal) || 20
  const claimed = progress.claimed || 0
  const soldOut = claimed >= goal
  const pct = Math.min(100, (claimed / goal) * 100)
  const price = drop && drop.price_cents ? '$' + Math.round(drop.price_cents / 100) : ''
  const chosen = !!drop && drop.status !== 'moodboard'

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
        opens once a cluster is chosen
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
      <a className="pill" href={checkoutUrl(size)} target="_blank" rel="noopener noreferrer">
        pre-order{size ? ' size ' + size : ''}, {price}
      </a>
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

          {action}

          <ul className="facts mu">
            <li>ships to the united states only</li>
            <li>cancel and refund anytime before production</li>
            <li>secure checkout through shopify</li>
          </ul>
        </div>
      </div>

      <div className="pocs">
        <section className="g poc">
          <h2>what you&apos;re pre-ordering</h2>
          <p>
            A shirt before its design is final. The community picks the idea: once a cluster is chosen on the
            moodboard, pre-orders open and I design the tee from it. You&apos;ll see a draft and
            can give feedback before it&apos;s finalized. Once all {goal} pieces are claimed, buyers vote to
            approve the final design before it goes to print.
          </p>
          <p>
            Pre-orderers&apos; votes carry more weight. Sign in to the site with the same email you check out
            with so your order is matched to your account.
          </p>
        </section>

        <section className="g poc">
          <h2>what happens next</h2>
          <ol className="hiw">
            <li>The community votes and a cluster is chosen. Pre-orders open.</li>
            <li>You pre-order and get a confirmation email.</li>
            <li>A draft is posted, and the design is revised with feedback.</li>
            <li>When all {goal} are claimed, buyers vote to approve the design.</li>
            <li>The shirts are printed and shipped.</li>
          </ol>
        </section>

        <section className="g poc">
          <h2>cancel and refund</h2>
          <p>
            You can cancel and be refunded at any time up until production starts. If you cancel, your
            pre-order&apos;s vote weight is removed. Once the design is approved and sent to print, orders
            are final. To cancel, reply to your order confirmation email.
          </p>
        </section>

        <section className="g poc">
          <h2>shipping</h2>
          <p>
            Ships to the United States only. Shipping cost is shown at checkout, and the ship date is
            announced once production starts.
          </p>
        </section>

        <section className="g poc">
          <h2>sizing and garment</h2>
          <p>
            Sizes S to XL. The blank, fabric and fit details are announced once the design is final, before
            the approval vote.
          </p>
        </section>

        <p className="mu pof">
          Questions? Reach out through{' '}
          <a href="https://threeletters.net" target="_blank" rel="noopener noreferrer">
            threeletters.net
          </a>
          .
        </p>
      </div>
    </main>
  )
}
