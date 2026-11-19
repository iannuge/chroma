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
  rawClusters: [],
  clusterScores: {},
  rawItems: [],
  itemScores: {},
  myClusterVotes: {},
  myItemVotes: {},
  progress: { claimed: 0, goal: 100 },
  hasOrder: false,
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

  const load = useCallback(async () => {
    try {
      const dr = await supabase
        .from('drops')
        .select('*')
        .order('number', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (dr.error) throw dr.error
      const drop = dr.data
      if (!drop) {
        setData(EMPTY)
        setStatus('ready')
        return
      }

      const none = Promise.resolve({ data: [] })
      const [cl, csc, prog, ord, mcv] = await Promise.all([
        supabase
          .from('clusters')
          .select('id,name,created_at,created_by,profiles(display_name)')
          .eq('drop_id', drop.id),
        supabase.from('cluster_scores').select('cluster_id,score').eq('drop_id', drop.id),
        supabase.from('drop_progress').select('claimed,goal').eq('drop_id', drop.id).maybeSingle(),
        uid
          ? supabase.from('orders').select('id').eq('drop_id', drop.id).eq('user_id', uid).limit(1)
          : none,
        uid
          ? supabase.from('cluster_votes').select('cluster_id,value').eq('user_id', uid)
          : none,
      ])
      if (cl.error) throw cl.error

      const clusters = cl.data || []
      const ids = clusters.map((c) => c.id)
      let rawItems = []
      let itemScoreRows = []
      let myItemRows = []
      if (ids.length) {
        const [it, isc, miv] = await Promise.all([
          supabase
            .from('items')
            .select('id,cluster_id,caption,image_path,color,created_at,created_by,profiles(display_name)')
            .in('cluster_id', ids),
          supabase.from('item_scores').select('item_id,score').in('cluster_id', ids),
          uid ? supabase.from('item_votes').select('item_id,value').eq('user_id', uid) : none,
        ])
        if (it.error) throw it.error
        rawItems = it.data || []
        itemScoreRows = isc.data || []
        myItemRows = miv.data || []
      }

      setData({
        drop,
        rawClusters: clusters,
        clusterScores: toMap(csc.data, 'cluster_id', 'score'),
        rawItems,
        itemScores: toMap(itemScoreRows, 'item_id', 'score'),
        myClusterVotes: toMap(mcv.data, 'cluster_id', 'value'),
        myItemVotes: toMap(myItemRows, 'item_id', 'value'),
        progress: prog.data || { claimed: 0, goal: drop.goal },
        hasOrder: !!(ord.data && ord.data.length),
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
      setMsg('Sign in with Google to vote or add to the moodboard.')
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

  const value = {
    drop: data.drop,
    clusters,
    progress: data.progress,
    hasOrder: data.hasOrder,
    status,
    msg,
    setMsg,
    vote,
    addCluster,
    addItem,
    reload: load,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
