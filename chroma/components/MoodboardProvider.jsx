'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'
import { imgUrl, resizeToJpeg, TONES } from '../lib/util'

const Ctx = createContext(null)

export function useMoodboard() {
  return useContext(Ctx)
}

const EMPTY = {
  drop: null,
  drops: [],
  rawClusters: [],
  clusterScores: {},
  rawItems: [],
  itemScores: {},
  myClusterVotes: {},
  myItemVotes: {},
  progress: { claimed: 0, goal: 100, waitlist: 0 },
  hasOrder: false,
  myClaim: null,
}

function toMap(rows, k, v) {
  const m = {}
  ;(rows || []).forEach((r) => {
    m[r[k]] = Number(r[v])
  })
  return m
}

export default function MoodboardProvider({ children }) {
  const { user } = useAuth()
  const uid = user ? user.id : null
  const [data, setData] = useState(EMPTY)
  const [status, setStatus] = useState('loading')
  const [msg, setMsg] = useState('')
  const [prompt, setPrompt] = useState(false)

  const load = useCallback(async () => {
    try {
      const dr = await supabase.from('drops').select('*').order('number', { ascending: false })
      if (dr.error) throw dr.error
      const drops = dr.data || []
      const drop = drops[0] || null
      if (!drop) {
        setData(EMPTY)
        setStatus('ready')
        return
      }

      const none = Promise.resolve({ data: [] })
      const [cl, csc, prog, ord, mcv, mine] = await Promise.all([
        supabase
          .from('clusters')
          .select('id,name,created_at,created_by,won_drop_id,profiles!created_by(display_name)'),
        supabase.from('cluster_scores').select('cluster_id,score'),
        supabase.from('drop_progress').select('claimed,goal,waitlist').eq('drop_id', drop.id).maybeSingle(),
        uid
          ? supabase.from('orders').select('id').eq('drop_id', drop.id).eq('user_id', uid).limit(1)
          : none,
        uid
          ? supabase.from('cluster_votes').select('cluster_id,value').eq('user_id', uid)
          : none,
        uid ? supabase.rpc('my_claim') : Promise.resolve({ data: null }),
      ])
      if (cl.error) throw cl.error

      const clusters = cl.data || []
      let rawItems = []
      let itemScoreRows = []
      let myItemRows = []
      if (clusters.length) {
        const [it, isc, miv] = await Promise.all([
          supabase
            .from('items')
            .select('id,cluster_id,caption,image_path,color,created_at,created_by,profiles!created_by(display_name)'),
          supabase.from('item_scores').select('item_id,score'),
          uid ? supabase.from('item_votes').select('item_id,value').eq('user_id', uid) : none,
        ])
        if (it.error) throw it.error
        rawItems = it.data || []
        itemScoreRows = isc.data || []
        myItemRows = miv.data || []
      }

      setData({
        drop,
        drops,
        rawClusters: clusters,
        clusterScores: toMap(csc.data, 'cluster_id', 'score'),
        rawItems,
        itemScores: toMap(itemScoreRows, 'item_id', 'score'),
        myClusterVotes: toMap(mcv.data, 'cluster_id', 'value'),
        myItemVotes: toMap(myItemRows, 'item_id', 'value'),
        progress: prog.data || { claimed: 0, goal: drop.goal },
        hasOrder: !!(ord.data && ord.data.length),
        myClaim: (mine && mine.data) || null,
        claimUid: uid,
      })
      setStatus('ready')
    } catch (e) {
      setStatus('error')
      setMsg('Could not load the moodboard: ' + (e && e.message ? e.message : 'unknown error'))
    }
  }, [uid])

  useEffect(() => {
    load()
  }, [load])

  // Live updates when anyone adds a cluster or item, plus a gentle refresh for vote totals.
  useEffect(() => {
    let t
    const soon = () => {
      clearTimeout(t)
      t = setTimeout(load, 400)
    }
    const ch = supabase
      .channel('moodboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clusters' }, soon)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, soon)
      .subscribe()
    const poll = setInterval(load, 30000)
    return () => {
      clearTimeout(t)
      clearInterval(poll)
      supabase.removeChannel(ch)
    }
  }, [load])

  const clusters = useMemo(() => {
    const list = data.rawClusters.map((c) => {
      const items = data.rawItems
        .filter((i) => i.cluster_id === c.id)
        .map((i) => ({
          id: i.id,
          clusterId: i.cluster_id,
          caption: i.caption || '',
          byId: i.created_by,
          img: imgUrl(i.image_path),
          color: i.color || '#d9d9d6',
          by: (i.profiles && i.profiles.display_name) || 'Someone',
          score: data.itemScores[i.id] || 0,
          mine: data.myItemVotes[i.id] || 0,
          at: i.created_at,
        }))
        .sort((a, b) => b.score - a.score || (a.at < b.at ? -1 : 1))
      return {
        id: c.id,
        name: c.name,
        by: (c.profiles && c.profiles.display_name) || 'Someone',
        byId: c.created_by,
        won: !!c.won_drop_id,
        wonNumber: c.won_drop_id ? (data.drops.find((d) => d.id === c.won_drop_id) || {}).number : null,
        score: data.clusterScores[c.id] || 0,
        mine: data.myClusterVotes[c.id] || 0,
        at: c.created_at,
        items,
      }
    })
    return list.sort((a, b) => b.score - a.score || (a.at < b.at ? -1 : 1))
  }, [data])

  const need = () => {
    if (!uid) {
      setPrompt(true)
      return false
    }
    return true
  }

  const upload = async (file) => {
    if (!file) return null
    const blob = await resizeToJpeg(file)
    const path = uid + '/' + crypto.randomUUID() + '.jpg'
    const { error } = await supabase.storage
      .from('moodboard')
      .upload(path, blob, { contentType: 'image/jpeg' })
    if (error) throw error
    return path
  }

  const tone = () => TONES[Math.floor(Math.random() * TONES.length)]

  const vote = async (kind, id, d) => {
    if (!need()) return
    const table = kind === 'cluster' ? 'cluster_votes' : 'item_votes'
    const col = kind === 'cluster' ? 'cluster_id' : 'item_id'
    const mine = kind === 'cluster' ? data.myClusterVotes : data.myItemVotes
    const current = mine[id] || 0
    let res
    if (current === d) {
      res = await supabase.from(table).delete().eq('user_id', uid).eq(col, id)
    } else {
      res = await supabase
        .from(table)
        .upsert({ user_id: uid, [col]: id, value: d }, { onConflict: 'user_id,' + col })
    }
    if (res.error) setMsg(res.error.message)
    await load()
  }

  const addCluster = async (name, file) => {
    if (!need() || !data.drop) return false
    if (!name || !file) {
      setMsg('Give the cluster a name and a first image.')
      return false
    }
    try {
      const img = await upload(file)
      const c = await supabase
        .from('clusters')
        .insert({ drop_id: data.drop.id, name, created_by: uid })
        .select('id')
        .single()
      if (c.error) throw c.error
      const i = await supabase
        .from('items')
        .insert({ cluster_id: c.data.id, image_path: img, color: tone(), created_by: uid })
      if (i.error) throw i.error
      await load()
      return true
    } catch (e) {
      setMsg((e && e.message) || 'Something went wrong')
      return false
    }
  }

  const addItem = async (clusterId, file) => {
    if (!need()) return false
    if (!file) {
      setMsg('Choose an image to add.')
      return false
    }
    try {
      const target = data.rawClusters.find((c) => c.id === clusterId)
      if (target && target.won_drop_id) {
        setMsg('This cluster already won a drop, so it is closed.')
        return false
      }
      const img = await upload(file)
      const i = await supabase
        .from('items')
        .insert({ cluster_id: clusterId, image_path: img, color: tone(), created_by: uid })
      if (i.error) throw i.error
      await load()
      return true
    } catch (e) {
      setMsg((e && e.message) || 'Something went wrong')
      return false
    }
  }

  const reportItem = async (itemId, reason) => {
    if (!need()) return { ok: false, error: 'Sign in to report an image.' }
    const { error } = await supabase
      .from('reports')
      .insert({ item_id: itemId, reporter_id: uid, reason: reason || null })
    if (error) {
      if (error.code === '23505') return { ok: false, error: 'You already reported this image.' }
      return { ok: false, error: error.message }
    }
    await load()
    return { ok: true }
  }

  const deleteItem = async (itemId) => {
    if (!need()) return { ok: false, error: 'Sign in first.' }
    const it = data.rawItems.find((i) => i.id === itemId)
    if (!it) return { ok: false, error: 'Image not found.' }
    const del = await supabase.from('items').delete().eq('id', itemId).eq('created_by', uid).select('id')
    if (del.error) return { ok: false, error: del.error.message }
    if (!del.data || !del.data.length) return { ok: false, error: 'You can only delete your own images.' }
    if (it.image_path) await supabase.storage.from('moodboard').remove([it.image_path])
    const left = data.rawItems.filter((i) => i.cluster_id === it.cluster_id && i.id !== itemId).length
    const cl = data.rawClusters.find((c) => c.id === it.cluster_id)
    if (!left && cl && cl.created_by === uid) {
      await supabase.from('clusters').delete().eq('id', cl.id).eq('created_by', uid)
    }
    await load()
    return { ok: true }
  }

  const claimCall = async (fn, args) => {
    if (!uid) return { ok: false, error: 'Sign in first.' }
    const r = await supabase.rpc(fn, args)
    await load()
    if (r.error) return { ok: false, error: r.error.message }
    return r.data || { ok: false, error: 'Something went wrong.' }
  }
  const claimShirt = (size) => claimCall('claim_shirt', { p_size: size })
  const joinWaitlist = (size) => claimCall('join_waitlist', { p_size: size })
  const forfeitClaim = () => claimCall('forfeit_claim')

  const value = {
    myClaim: data.myClaim,
    // false until my_claim has been fetched for the signed-in user, so the page never offers a claim too early
    claimsReady: !uid || data.claimUid === uid,
    claimShirt,
    joinWaitlist,
    forfeitClaim,
    drop: data.drop,
    drops: data.drops,
    clusters,
    progress: data.progress,
    hasOrder: data.hasOrder,
    status,
    msg,
    setMsg,
    prompt,
    setPrompt,
    vote,
    addCluster,
    addItem,
    reportItem,
    deleteItem,
    reload: load,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
