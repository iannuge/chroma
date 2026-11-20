'use client'

import Link from 'next/link'
import { useState } from 'react'
import Tile from '../../components/Tile'
import Lightbox from '../../components/Lightbox'
import TeeMock from '../../components/TeeMock'
import { useMoodboard } from '../../components/MoodboardProvider'
import WorkGallery from '../../components/WorkGallery'

const pad = (n) => String(n).padStart(2, '0')

function fmtDate(d) {
  if (!d) return null
  const t = new Date(d + 'T12:00:00')
  return isNaN(t) ? d : t.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function PastDrop({ drop, cluster, onOpen }) {
  const rows = [
    ['Price', drop.price_cents ? '$' + Math.round(drop.price_cents / 100) : null],
    ['Released', fmtDate(drop.released_on)],
    ['Produced', drop.produced ? drop.produced + ' pieces' : null],
    ['Winning cluster', cluster ? cluster.name : null],
    ['Started by', cluster ? cluster.by : null],
    ['Final score', cluster ? (cluster.score > 0 ? '+' : '') + cluster.score : null],
  ].filter((r) => r[1] != null)

  return (
    <article className="pdrop">
      <div className="pdd">
        {drop.design_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={drop.design_image} alt={'Drop ' + pad(drop.number) + ' design'} />
        ) : (
          <TeeMock blur label="CENSORED" />
        )}
      </div>

      <div className="g pdt">
        <h3>
          Drop {pad(drop.number)}: {drop.theme}
        </h3>
        <dl>
          {rows.map((r) => (
            <div key={r[0]}>
              <dt>{r[0]}</dt>
              <dd>{r[1]}</dd>
            </div>
          ))}
        </dl>
      </div>

      {cluster && (
        <div className="pdm">
          <h4>
            The moodboard: <Link href={'/cluster/' + cluster.id}>{cluster.name}</Link>
          </h4>
          <div className="pg">
            {cluster.items.map((it) => (
              <Tile key={it.id} item={it} onOpen={onOpen} />
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

export default function Archive() {
  const { drops, clusters, status } = useMoodboard()
  const [open, setOpen] = useState(null)

  const past = drops
    .filter((d) => d.status === 'shipped' && d.winning_cluster_id)
    .sort((a, b) => b.number - a.number)
  const byCluster = {}
  clusters.forEach((c) => {
    byCluster[c.id] = c
  })
  const allItems = clusters.flatMap((c) => c.items)

  return (
    <main className="w page early">
      <Link className="bk g" href="/">
        Back home
      </Link>

      {past.length > 0 ? (
        <>
          <div className="cvh">
            <h1>Past drops</h1>
            <p className="mu sub">every shirt, newest first: the design, the details, and the moodboard that made it.</p>
          </div>
          <div className="pdl">
            {past.map((d) => (
              <PastDrop key={d.id} drop={d} cluster={byCluster[d.winning_cluster_id]} onOpen={(x) => setOpen(x.id)} />
            ))}
          </div>
        </>
      ) : (
        <div className="cvh">
          <h1>You&apos;re early!</h1>
          <p className="mu sub">
            in the future, this page will showcase each previous drop&apos;s design. in the meantime, heres
            some of my own shirt designs i&apos;m proud of.
          </p>
        </div>
      )}

      {past.length > 0 && <h2 className="sh">more of my own work</h2>}
      <WorkGallery />
      {status === 'loading' && <p className="mu">Loading…</p>}
      <Lightbox item={allItems.find((i) => i.id === open) || null} onClose={() => setOpen(null)} />
    </main>
  )
}
