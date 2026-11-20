'use client'

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = {
  name: '',
  email: '',
  address: '',
  work: '',
  urls: '',
  good: false,
  acc: false,
  sig: '',
}

export default function Copyright() {
  const [f, setF] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const { error } = await supabase.from('copyright_claims').insert({
      claimant_name: f.name.trim(),
      claimant_email: f.email.trim(),
      claimant_address: f.address.trim() || null,
      work_description: f.work.trim(),
      infringing_urls: f.urls.trim(),
      good_faith: f.good,
      accuracy_statement: f.acc,
      signature: f.sig.trim(),
    })
    setBusy(false)
    if (error) setErr('Could not send your notice: ' + error.message)
    else {
      setDone(true)
      setF(EMPTY)
    }
  }

  return (
    <main className="w page po">
      <Link className="bk g" href="/">
        Back home
      </Link>
      <div className="cvh">
        <h1>Copyright complaints</h1>
        <p className="mu">chroma respects the rights of artists and photographers</p>
      </div>

      <div className="pocs">
        <section className="g poc">
          <h2>how it works</h2>
          <p>
            if you own the copyright to something posted on the moodboard and did not give permission, you can send
            us a notice below. when we receive a complete notice, we remove or disable access to the material
            quickly, and we tell the person who uploaded it.
          </p>
          <p>
            an image reported by two different users is also hidden automatically until it has been reviewed.
            accounts that repeatedly upload infringing material are removed.
          </p>
        </section>

        <section className="g poc">
          <h2>send a notice</h2>
          {done ? (
            <p>Thank you. We received your notice and will review it as soon as we can.</p>
          ) : (
            <form className="cform" onSubmit={submit}>
              <label>
                your full name
                <input type="text" required maxLength={200} value={f.name} onChange={set('name')} />
              </label>
              <label>
                your email
                <input type="email" required maxLength={200} value={f.email} onChange={set('email')} />
              </label>
              <label>
                your mailing address
                <input type="text" maxLength={500} value={f.address} onChange={set('address')} />
              </label>
              <label>
                the work you own (describe it, or link to the original)
                <textarea required rows={3} maxLength={2000} value={f.work} onChange={set('work')} />
              </label>
              <label>
                where it appears on chroma (the cluster link, and which image)
                <textarea required rows={3} maxLength={2000} value={f.urls} onChange={set('urls')} />
              </label>
              <label className="ck">
                <input type="checkbox" required checked={f.good} onChange={set('good')} />I have a good faith belief that
                the use described above is not authorized by the copyright owner, its agent, or the law.
              </label>
              <label className="ck">
                <input type="checkbox" required checked={f.acc} onChange={set('acc')} />
                the information in this notice is accurate, and under penalty of perjury I am the copyright owner or
                authorized to act on the owner&apos;s behalf.
              </label>
              <label>
                electronic signature (type your full name)
                <input type="text" required maxLength={200} value={f.sig} onChange={set('sig')} />
              </label>
              <button className="pill" disabled={busy}>
                {busy ? 'Sending…' : 'Send notice'}
              </button>
              {err && <p className="mu">{err}</p>}
            </form>
          )}
        </section>

        <section className="g poc">
          <h2>if your upload was removed</h2>
          <p>
            if you believe your upload was removed by mistake, or that you have permission to use it, you can send a
            counter-notice through threeletters.net or instagram @iannuge. include your name, contact details, the image, and a statement
            under penalty of perjury that you believe it was removed by mistake. if the original complainant does not
            take legal action, we may restore it.
          </p>
          <p>
            sending a false notice can have legal consequences. only send one if you really own the work. you may
            want to talk to a lawyer first.
          </p>
        </section>

        <p className="mu pof">
          <Link href="/terms">terms of service</Link>
        </p>
      </div>
    </main>
  )
}
