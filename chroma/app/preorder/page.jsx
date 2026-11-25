'use client'

import Link from 'next/link'
import { useState } from 'react'
import TeeHero from '../../components/TeeHero'
import { useMoodboard } from '../../components/MoodboardProvider'
import { useAuth } from '../../components/AuthProvider'
import Comments from '../../components/Comments'
import { SIZES } from '../../lib/shop'

const pad = (n) => String(n).padStart(2, '0')

export default function ClaimShirt() {
  const { drop, progress, hasOrder, myClaim, claimsReady, claimShirt, joinWaitlist, forfeitClaim } = useMoodboard()
  const { user, signIn } = useAuth()
  const [size, setSize] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmForfeit, setConfirmForfeit] = useState(false)

  const run = async (fn, arg) => {
    setBusy(true)
    setMsg('')
    const r = await fn(arg)
    setBusy(false)
    setConfirmForfeit(false)
    if (!r.ok) setMsg((r.error || 'something went wrong.').toLowerCase())
  }

  const goal = progress.goal || (drop && drop.goal) || 20
  const claimed = progress.claimed || 0
  const waiting = progress.waitlist || 0
  const full = claimed >= goal
  const pct = Math.min(100, (claimed / goal) * 100)
  const price = drop && drop.price_cents ? '$' + Math.round(drop.price_cents / 100) : ''
  const st = myClaim && myClaim.status

  const until = myClaim && myClaim.window_ends_at ? new Date(myClaim.window_ends_at) : null
  const untilText = until
    ? until.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : ''

  let action
  if (hasOrder || st === 'purchased') {
    action = (
      <button className="pill" disabled>
        you&apos;ve pre-ordered this drop
      </button>
    )
  } else if (user && !claimsReady) {
    action = (
      <button className="pill" disabled>
        checking your spot…
      </button>
    )
  } else if (!user) {
    action = (
      <button className="pill" onClick={() => signIn()}>
        sign in to {full ? 'join the waitlist' : 'claim a shirt'}
      </button>
    )
  } else if (st === 'claimed') {
    action = (
      <>
        <div className="clm">
          <b>you&apos;ve claimed a shirt, size {myClaim.size}.</b>
          <span className="mu">
            {until
              ? 'purchase window closes ' + untilText + '.'
              : 'once the design is finalized you\'ll have 48 hours to buy it.'}
          </span>
        </div>
        {confirmForfeit ? (
          <div className="clf">
            <span className="mu">give up your spot? it goes to the next person on the waitlist.</span>
            <div className="row2">
              <button className="pill" onClick={() => run(forfeitClaim)} disabled={busy}>
                yes, forfeit
              </button>
              <button className="pill" onClick={() => setConfirmForfeit(false)} disabled={busy}>
                keep it
              </button>
            </div>
          </div>
        ) : (
          <button className="pill sub" onClick={() => setConfirmForfeit(true)}>
            forfeit claim
          </button>
        )}
      </>
    )
  } else if (st === 'waitlist') {
    action = (
      <>
        <div className="clm">
          <b>you&apos;re #{myClaim.position} in line, size {myClaim.size}.</b>
          <span className="mu">if a spot opens up it&apos;s yours, first come first served.</span>
        </div>
        {confirmForfeit ? (
          <div className="clf">
            <span className="mu">leave the waitlist? you&apos;ll lose your place in line.</span>
            <div className="row2">
              <button className="pill" onClick={() => run(forfeitClaim)} disabled={busy}>
                yes, leave
              </button>
              <button className="pill" onClick={() => setConfirmForfeit(false)} disabled={busy}>
                stay
              </button>
            </div>
          </div>
        ) : (
          <button className="pill sub" onClick={() => setConfirmForfeit(true)}>
            leave waitlist
          </button>
        )}
      </>
    )
  } else if (!size) {
    action = (
      <button className="pill" disabled>
        choose a size
      </button>
    )
  } else if (full) {
    action = (
      <button className="pill" onClick={() => run(joinWaitlist, size)} disabled={busy}>
        {busy ? 'joining…' : 'join the waitlist, size ' + size}
      </button>
    )
  } else {
    action = (
      <button className="pill" onClick={() => run(claimShirt, size)} disabled={busy}>
        {busy ? 'claiming…' : 'claim a shirt, size ' + size}
      </button>
    )
  }

  const pickSize = !st && !hasOrder && (!user || claimsReady)

  return (
    <main className="w page po">
      <Link className="bk g" href="/">
        Back home
      </Link>

      <div className="cvh">
        <h1>Claim a shirt</h1>
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
              {claimed} of {goal} claimed{waiting > 0 ? ' · ' + waiting + ' on the waitlist' : ''}
            </span>
          </div>

          <div className="sz" role="radiogroup" aria-label="Size">
            {SIZES.map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={(st ? myClaim.size : size) === s}
                className={'szb' + ((st ? myClaim.size : size) === s ? ' on' : '')}
                onClick={() => setSize(s)}
                disabled={!pickSize}
              >
                {s}
              </button>
            ))}
          </div>

          {action}
          {msg && <p className="mu">{msg}</p>}

          <ul className="facts mu">
            <li>claiming is free. nothing is charged until you buy</li>
            <li>one claim per account. you need to be signed in</li>
            <li>ships to the united states only</li>
          </ul>
        </div>
      </div>

      {drop && drop.design_image && <Comments kind="design" id={drop.id} title="comments on the design" />}

      <div className="pocs">
        <section className="g poc">
          <h2>how claiming works</h2>
          <ol className="hiw">
            <li>
              <b>Claim.</b> Sign in, pick your size and claim a spot. It&apos;s free, and there are only {goal}.
            </li>
            <li>
              <b>Wait for the design.</b> The community picks the idea, I design the tee from it, and you can
              give feedback on the draft.
            </li>
            <li>
              <b>Buy within 48 hours.</b> Once the design is finalized, everyone with a claim has 48 hours to
              purchase their shirt.
            </li>
            <li>
              <b>Or let it go.</b> If you don&apos;t buy in time, or you forfeit, your spot goes to the next
              person on the waitlist. Hit forfeit any time before then if you change your mind.
            </li>
          </ol>
          <p>
            Full? Join the waitlist with the size you want. It&apos;s first come, first served, and you&apos;ll
            see your place in line.
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
