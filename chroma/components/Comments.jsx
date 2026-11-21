'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'
import { useMoodboard } from './MoodboardProvider'
import VoteBox from './VoteBox'

// A small, expandable comment box. kind: 'cluster' now, 'design' for the shirt once there is a draft.
const ago = (iso) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'now'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  return Math.floor(s / 86400) + 'd'
}

export function Avatar({ url, name, size = 30 }) {
  const style = { width: size, height: size, fontSize: size * 0.45 }
  return url ? (
    <img className="cmav" style={style} src={url} alt="" referrerPolicy="no-referrer" />
  ) : (
    <span className="cmav" style={style}>
      {(name || '?').slice(0, 1).toUpperCase()}
    </span>
  )
}

export default function Comments({ kind, id, title = 'comments' }) {
  const { user } = useAuth()
  const { setPrompt } = useMoodboard()
  const [list, setList] = useState([])
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const area = useRef(null)

  const load = useCallback(async () => {
    const c = await supabase
      .from('comments')
      .select('id,body,created_at,created_by,profiles!created_by(display_name,avatar_url)')
      .eq('target_kind', kind)
      .eq('target_id', id)
      .order('created_at', { ascending: true })
    if (c.error) return
    const rows = c.data || []
    const ids = rows.map((r) => r.id)
    let scores = {}
    let mine = {}
    if (ids.length) {
      const [s, m] = await Promise.all([
        supabase.from('comment_scores').select('comment_id,score').in('comment_id', ids),
        user ? supabase.from('comment_votes').select('comment_id,value').in('comment_id', ids) : Promise.resolve({ data: [] }),
      ])
      ;(s.data || []).forEach((r) => (scores[r.comment_id] = Number(r.score)))
      ;(m.data || []).forEach((r) => (mine[r.comment_id] = r.value))
    }
    const out = rows
      .map((r) => ({
        id: r.id,
        body: r.body,
        at: r.created_at,
        byId: r.created_by,
        by: (r.profiles && r.profiles.display_name) || 'Someone',
        avatar: r.profiles && r.profiles.avatar_url,
        score: scores[r.id] || 0,
        mine: mine[r.id] || 0,
      }))
      .sort((a, b) => b.score - a.score || (a.at < b.at ? -1 : 1))
    setList(out)
  }, [kind, id, user])

  useEffect(() => {
    load()
  }, [load])

  const need = () => {
    if (user) return false
    setPrompt(true)
    return true
  }

  const post = async (e) => {
    e.preventDefault()
    if (need()) return
    const body = text.trim()
    if (!body) return
    setBusy(true)
    setMsg('')
    const { error } = await supabase
      .from('comments')
      .insert({ target_kind: kind, target_id: id, body, created_by: user.id })
    setBusy(false)
    if (error) {
      setMsg(error.message)
      return
    }
    setText('')
    setOpen(true)
    load()
  }

  const vote = async (cid, current, d) => {
    if (need()) return
    if (current === d) {
      await supabase.from('comment_votes').delete().eq('comment_id', cid).eq('user_id', user.id)
    } else {
      await supabase
        .from('comment_votes')
        .upsert({ comment_id: cid, user_id: user.id, value: d }, { onConflict: 'user_id,comment_id' })
    }
    load()
  }

  const remove = async (cid) => {
    await supabase.from('comments').delete().eq('id', cid).eq('created_by', user.id)
    load()
  }

  return (
    <section className={'cm g' + (open ? ' open' : '')} aria-label={title}>
      <button type="button" className="cmh" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>
          {title} <span className="mu">{list.length}</span>
        </span>
        <span className="cmx">{open ? '−' : '+'}</span>
      </button>
      <div className="cmb">
        <div className="cmbi">
          <ul className="cml">
            {list.length === 0 && <li className="mu cme">no comments yet.</li>}
            {list.map((c) => (
              <li key={c.id} className="cmi">
                <Avatar url={c.avatar} name={c.by} />
                <div className="cmt">
                  <div className="cmm">
                    <Link href={'/u/' + c.byId}>{c.by}</Link>
                    <span className="mu">{ago(c.at)}</span>
                    {user && user.id === c.byId && (
                      <button type="button" className="cmd mu" onClick={() => remove(c.id)}>
                        delete
                      </button>
                    )}
                  </div>
                  <p>{c.body}</p>
                </div>
                <VoteBox score={c.score} mine={c.mine} onVote={(d) => vote(c.id, c.mine, d)} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <form className="cmf" onSubmit={post}>
        <textarea
          ref={area}
          rows={open ? 3 : 1}
          maxLength={1000}
          placeholder={user ? 'add a comment…' : 'sign in to comment'}
          aria-label="Add a comment"
          value={text}
          onFocus={() => setOpen(true)}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="pill" disabled={busy || (!!user && !text.trim())}>
          {busy ? '…' : 'Post'}
        </button>
      </form>
      {msg && <p className="mu cmmsg">{msg}</p>}
    </section>
  )
}
