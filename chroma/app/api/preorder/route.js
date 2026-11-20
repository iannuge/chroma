import { timingSafeEqual } from 'node:crypto'
import { checkoutUrl } from '../../../lib/shop.server'

export const dynamic = 'force-dynamic'

// Early-access password (not case sensitive). Override with PREORDER_PASSWORD in Vercel.
// Remove this gate when pre-orders open to everyone.
const PASSWORD = process.env.PREORDER_PASSWORD || 'gopril'

const same = (a, b) => {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}

export async function POST(req) {
  let body = {}
  try {
    body = await req.json()
  } catch (e) {}
  const pw = String(body.password || '').trim().toLowerCase()
  if (!same(pw, PASSWORD.toLowerCase())) {
    await new Promise((r) => setTimeout(r, 600))
    return Response.json({ ok: false, error: 'Wrong password.' }, { status: 401 })
  }
  if (!body.size) return Response.json({ ok: true })
  const url = checkoutUrl(body.size, body.qty)
  if (!url) return Response.json({ ok: false, error: 'Choose a size and quantity.' }, { status: 400 })
  return Response.json({ ok: true, url })
}
