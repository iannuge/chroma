import Link from 'next/link'
import TeeMock from '../../components/TeeMock'
import { ITER } from '../../lib/data'
import { HIDDEN_ART } from '../../lib/util'

export const metadata = { title: 'Previous iterations – CHROMA' }

export default function Iterations() {
  return (
    <main className="w page">
      <Link className="bk g" href="/">
        Back home
      </Link>
      <div className="cvh">
        <h1>Previous iterations</h1>
        <span className="mu">A new iteration lands every week.</span>
      </div>
      <div className="ig">
        {ITER.map((x) => (
          <article className="g pc" key={x.n}>
            <TeeMock art={x.art} />
            <div>
              <h3>Iteration {x.n}</h3>
              <p>{x.w}</p>
              <p style={{ color: 'var(--ink)' }}>{x.t}</p>
              <p>Pulled from: {x.f}</p>
            </div>
          </article>
        ))}
        <article className="g pc">
          <TeeMock art={HIDDEN_ART} blur />
          <div>
            <h3>Iteration 3</h3>
            <p>Lands at the next countdown</p>
          </div>
        </article>
      </div>
    </main>
  )
}
