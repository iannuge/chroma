'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useMoodboard } from './MoodboardProvider'
import Tile from './Tile'
import { Avatar } from './Comments'
import { fmtScore, imgUrl } from '../lib/util'

function toMap(rows, k) {
  const m = {}
  ;(rows || []).forEach((r) => {
    m[r[k]] = Number(r.score)
  })
  return m
}

const MAX_PHOTO = 8 * 1024 * 1024
const bucketPath = (u) => {
  const m = u && String(u).match(/\/object\/public\/moodboard\/(.+)$/)
  return m ? decodeURIComponent(m[1]) : null
}

// Center-crop to a small square so nobody uploads a 12mb photo as an avatar.
async function squarePhoto(file, size = 320) {
  const bmp = await createImageBitmap(file)
  const s = Math.min(bmp.width, bmp.height)
  const c = document.createElement('canvas')
  c.width = c.height = size
  c.getContext('2d').drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, size, size)
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Could not read that image.'))), 'image/jpeg', 0.9))
}

export default function ProfileView({ uid, isMe }) {
  const router = useRouter()
  const { reload } = useMoodboard()
  const [state, setState] = useState({ status: 'loading' })
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoMsg, setPhotoMsg] = useState('')
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const none = Promise.resolve({ data: [] })
      const [p, cl, it, ord, bd, mu] = await Promise.all([
        supabase.from('profiles').select('id,display_name,avatar_url,created_at').eq('id', uid).maybeSingle(),
        supabase.from('clusters').select('id,name,created_at').eq('created_by', uid),
        supabase
          .from('items')
          .select('id,cluster_id,caption,image_path,color,created_at')
          .eq('created_by', uid),
        isMe
          ? supabase.from('orders').select('id,created_at,drops(number,theme)').eq('user_id', uid)
          : none,
        supabase.from('user_badges').select('badge_slug,badges(label,color,description,sort)').eq('user_id', uid),
        supabase.rpc('profile_multiplier', { uid }),
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
      const badges = (bd.data || [])
        .filter((b) => b.badges)
        .map((b) => ({ slug: b.badge_slug, ...b.badges }))
        .sort((a, b) => a.sort - b.sort)
      const mult = mu && mu.data != null ? Number(mu.data) : 1
      setState({ status: 'ready', profile: p.data, clusters, items, orders: ord.data || [], badges, mult })
    } catch (e) {
      setState({ status: 'error' })
    }
  }, [uid, isMe])

  useEffect(() => {
    load()
  }, [load])

  const dropOld = async (url) => {
    const old = bucketPath(url)
    if (old && old.startsWith(uid + '/')) await supabase.storage.from('moodboard').remove([old])
  }

  const changePhoto = async (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setPhotoMsg('use a jpg, png or webp.')
      return
    }
    if (file.size > MAX_PHOTO) {
      setPhotoMsg('that file is too big. keep it under 8mb.')
      return
    }
    setPhotoBusy(true)
    setPhotoMsg('')
    try {
      const blob = await squarePhoto(file)
      const path = uid + '/avatar-' + Date.now() + '.jpg'
      const up = await supabase.storage.from('moodboard').upload(path, blob, { contentType: 'image/jpeg' })
      if (up.error) throw up.error
      const url = supabase.storage.from('moodboard').getPublicUrl(path).data.publicUrl
      const prev = state.profile && state.profile.avatar_url
      const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', uid)
      if (error) throw error
      await dropOld(prev)
      await load()
      reload()
    } catch (err) {
      setPhotoMsg((err && err.message ? err.message : 'could not upload that.').toLowerCase())
    }
    setPhotoBusy(false)
  }

  const removePhoto = async () => {
    setPhotoBusy(true)
    setPhotoMsg('')
    const prev = state.profile && state.profile.avatar_url
    const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', uid)
    if (error) setPhotoMsg(error.message.toLowerCase())
    else {
      await dropOld(prev)
      await load()
      reload()
    }
    setPhotoBusy(false)
  }

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

  const { profile, clusters, items, orders, badges, mult } = state
  const initial = (profile.display_name || '?').slice(0, 1).toUpperCase()

  return (
    <>
      <div className="phead">
        {isMe ? (
          <div className="pav">
            <button
              type="button"
              className="pav-b"
              onClick={() => fileRef.current && fileRef.current.click()}
              disabled={photoBusy}
              aria-label="Change profile photo"
            >
              <Avatar url={profile.avatar_url} name={profile.display_name} size={84} />
              <span className="pav-o">{photoBusy ? '…' : 'change'}</span>
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={changePhoto} hidden />
            <div className="pav-l mu">
              <button type="button" onClick={() => fileRef.current && fileRef.current.click()} disabled={photoBusy}>
                {photoBusy ? 'uploading…' : 'change photo'}
              </button>
              {profile.avatar_url && !photoBusy && (
                <>
                  {' · '}
                  <button type="button" onClick={removePhoto}>
                    remove
                  </button>
                </>
              )}
            </div>
            {photoMsg && <p className="mu pav-m">{photoMsg}</p>}
          </div>
        ) : (
          <Avatar url={profile.avatar_url} name={profile.display_name} size={84} />
        )}
        <div className="pnm">
          <h1>{profile.display_name}</h1>
          <span className="mult" tabIndex={0} aria-label="Vote multiplier">
            x{Math.round(mult * 100) / 100}
            <span className="tip">
              <b>vote multiplier</b>
              users who contribute more get more weight in their votes.
            </span>
          </span>
        </div>
        <div className="roles">
          {badges.map((b) => (
            <span
              key={b.slug}
              className="role"
              style={{ '--rc': b.color }}
              title={b.description || b.label}
            >
              <i />
              {b.label}
            </span>
          ))}
          <span className="role stat" title="images added and clusters started">
            {items.length} {items.length === 1 ? 'element' : 'elements'} · {clusters.length}{' '}
            {clusters.length === 1 ? 'cluster' : 'clusters'}
          </span>
        </div>
        <span className="mu">
          joined{' '}
          {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }).toLowerCase()}
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
