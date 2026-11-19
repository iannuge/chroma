import Link from 'next/link'
import TeeMock from '../../components/TeeMock'
import { PAST } from '../../lib/data'

export const metadata = { title: 'Past drops – CHROMA' }

export default function Archive() {
  return (
    <main className="w page">
      <Link className="bk g" href="/">
        Back home
      </Link>
      <div className="cvh">
        <h1>Past drops</h1>
        <span className="mu">Sample data for now. Real drops will appear here once printed.</span>
      </div>
      <div className="pd">
        {PAST.map((x) => (
          <article className="g pc" key={x.n}>
            <TeeMock art={x.art} />
            <div>
              <h3>
                Drop {x.n}: {x.t}
              </h3>
              <dl>
                {x.d.map((r) => (
                  <div key={r[0]}>
                    <dt>{r[0]}</dt>
                    <dd>{r[1]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
