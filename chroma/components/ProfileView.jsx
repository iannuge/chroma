'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useMoodboard } from './MoodboardProvider'
import Tile from './Tile'
import { fmtScore, imgUrl } from '../lib/util'

function toMap(rows, k) {
  const m = {}
  ;(rows || []).forEach((r) => {
    m[r[k]] = Number(r.score)
  })
  return m
}

export default function ProfileView({ uid, isMe }) {
  const router = useRouter()
  const { reload } = useMoodboard()
  const [state, setState] = useState({ status: 'loading' })
  const [name, setName] = useState('')
  const [note, setNote] = useState('')

  const load = useCallback(async () => {
    try {
      const none = Promise.resolve({ data: [] })
      const [p, cl, it, ord] = await Promise.all([
        supabase.from('profiles').select('id,display_name,avatar_url,created_at').eq('id', uid).maybeSingle(),
        supabase.from('clusters').select('id,name,created_at').eq('created_by', uid),
        supabase
          .from('items')
          .select('id,cluster_id,caption,image_path,color,created_at')
          .eq('created_by', uid),
        isMe
          ? supabase.from('orders').select('id,created_at,drops(number,theme)').eq('user_id', uid)
          : none,
      ])
      if (p.error) throw p.error
      if (!p.data) {
        setState({ status: 'missing' })
        return
      }
      const cids = (cl.data || []).map((c) => c.id)
      const iids = (it.data || []).map((i) => i.id)
      const [cs, is] = await Promise.all([
        cids.length ? supabase.from('cluster_scores').select('cluster_id,score').in('cluster_id', cids) : none,
        iids.length ? supabase.from('item_scores').select('item_id,score').in('item_id', iids) : none,
      ])
      const cmap = toMap(cs.data, 'cluster_id')
      const imap = toMap(is.data, 'item_id')
      const clusters = (cl.data || [])
        .map((c) => ({ id: c.id, name: c.name, score: cmap[c.id] || 0 }))
        .sort((a, b) => b.score - a.score)
      const items = (it.data || [])
        .map((i) => ({
          id: i.id,
          clusterId: i.cluster_id,
          caption: i.caption || '',
          img: imgUrl(i.image_path),
          color: i.color || '#d9d9d6',
          score: imap[i.id] || 0,
        }))
        .sort((a, b) => b.score - a.score)
      setName(p.data.display_name || '')
      setState({ status: 'ready', profile: p.data, clusters, items, orders: ord.data || [] })
    } catch (e) {
      setState({ status: 'error' })
    }
  }, [uid, isMe])

  useEffect(() => {
    load()
  }, [load])

  const save = async (e) => {
    e.preventDefault()
    const n = name.trim()
    if (!n) {
      setNote('Add a name first.')
      return
    }
    const { error } = await supabase.from('profiles').update({ display_name: n }).eq('id', uid)
    if (error) {
      setNote(error.message)
      return
    }
    setNote('Saved')
    await load()
    reload()
  }

  if (state.status === 'loading') return <p className="mu">Loading…</p>
  if (state.status === 'missing') return <p className="mu">That profile could not be found.</p>
  if (state.status === 'error') return <p className="mu">Could not load this profile.</p>

  const { profile, clusters, items, orders } = state
  const initial = (profile.display_name || '?').slice(0, 1).toUpperCase()

  return (
    <>
      <div className="phead">
        {profile.avatar_url ? (
          <img className="avatar" src={profile.avatar_url} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="avatar">{initial}</span>
        )}
        <h1>{profile.display_name}</h1>
        <span className="mu">
          {clusters.length} {clusters.length === 1 ? 'cluster' : 'clusters'} · {items.length}{' '}
          {items.length === 1 ? 'image' : 'images'}
        </span>
      </div>

      {isMe && (
        <>
          <form className="add g pedit" onSubmit={save}>
            <input
              type="text"
              value={name}
              maxLength={40}
              placeholder="Display name"
              aria-label="Display name"
              onChange={(e) => setName(e.target.value)}
            />
            <button>Save name</button>
          </form>
          {note && (
            <p className="note g" role="status" onClick={() => setNote('')}>
              {note}
            </p>
          )}
          <div className="g bio pord">
            <b>Pre-orders</b>
            {orders.length ? (
              orders.map((o) => (
                <p key={o.id}>
                  Drop {String(o.drops ? o.drops.number : '').padStart(2, '0')}
                  {o.drops ? ': ' + o.drops.theme : ''}
                </p>
              ))
            ) : (
              <p className="mu">No pre-orders yet.</p>
            )}
          </div>
        </>
      )}

      <h2 className="sh">Clusters</h2>
      {clusters.length ? (
        <div className="chips">
          {clusters.map((c) => (
            <Link key={c.id} className="chip g" href={'/cluster/' + c.id}>
              {c.name} <span className="mu">{fmtScore(c.score)}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mu">No clusters yet.</p>
      )}

      <h2 className="sh">Images</h2>
      {items.length ? (
        <div className="pg">
          {items.map((it) => (
            <div key={it.id} className="pgi" onClick={() => router.push('/cluster/' + it.clusterId)}>
              <Tile item={it} hideBy />
            </div>
          ))}
        </div>
      ) : (
        <p className="mu">No images yet.</p>
      )}
    </>
  )
}
