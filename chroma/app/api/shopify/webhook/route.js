import { createHmac, timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Shopify webhook: keeps the "claimed" tracker, vote weight and cancellations in sync with real orders.
//
// Vercel environment variables (Settings > Environment Variables):
//   SHOPIFY_WEBHOOK_SECRET      the signing secret Shopify shows on Settings > Notifications > Webhooks
//   SUPABASE_SERVICE_ROLE_KEY   Supabase > Project Settings > API > service_role (secret, server only)
// Optional: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_VARIANT_ID (defaults match lib/shop.server.js).
//
// Shopify topics to subscribe to (format JSON): orders/paid, orders/cancelled.
const VARIANT_ID = String(process.env.NEXT_PUBLIC_VARIANT_ID || '44528449191999')
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slssmyekxnkyadqjptvu.supabase.co'

const verified = (raw, header, secret) => {
  if (!header || !secret) return false
  const mine = createHmac('sha256', secret).update(raw, 'utf8').digest()
  let theirs
  try {
    theirs = Buffer.from(header, 'base64')
  } catch (e) {
    return false
  }
  return mine.length === theirs.length && timingSafeEqual(mine, theirs)
}

export async function POST(req) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret || !key) return new Response('not configured', { status: 500 })

  const raw = await req.text()
  if (!verified(raw, req.headers.get('x-shopify-hmac-sha256'), secret)) {
    return new Response('bad signature', { status: 401 })
  }

  let order
  try {
    order = JSON.parse(raw)
  } catch (e) {
    return new Response('bad json', { status: 400 })
  }
  const topic = req.headers.get('x-shopify-topic') || ''
  const orderId = String(order.id || '')
  if (!orderId) return new Response('no order id', { status: 400 })

  const db = createClient(SUPABASE_URL, key, { auth: { persistSession: false } })

  if (topic === 'orders/cancelled') {
    const { error } = await db
      .from('orders')
      .update({ cancelled_at: order.cancelled_at || new Date().toISOString() })
      .eq('shopify_order_id', orderId)
    if (error) return new Response('db error', { status: 500 })
    return new Response('ok')
  }

  if (topic !== 'orders/paid') return new Response('ignored')

  // Only count lines for the drop product (shared pool), and read the Size property.
  const lines = (order.line_items || []).filter((l) => String(l.variant_id) === VARIANT_ID)
  if (!lines.length) return new Response('not a drop order')
  const quantity = lines.reduce((n, l) => n + (Number(l.quantity) || 0), 0)
  const sizeProp = (lines[0].properties || []).find((p) => String(p.name).toLowerCase() === 'size')
  const size = sizeProp ? String(sizeProp.value).slice(0, 8) : null
  const email = String(order.email || (order.customer && order.customer.email) || '').trim().toLowerCase()
  if (!email || quantity < 1) return new Response('missing data', { status: 400 })

  // The drop being sold: the newest one.
  const drop = await db.from('drops').select('id').order('number', { ascending: false }).limit(1).maybeSingle()
  if (drop.error || !drop.data) return new Response('no drop', { status: 500 })

  const { error } = await db.from('orders').upsert(
    {
      shopify_order_id: orderId,
      email,
      drop_id: drop.data.id,
      quantity,
      size,
      test: !!order.test,
      cancelled_at: null,
    },
    { onConflict: 'shopify_order_id' }
  )
  if (error) return new Response('db error', { status: 500 })
  return new Response('ok')
}
