// Pre-order checkout via a Shopify cart permalink.
// One product, one variant, one shared inventory pool (set in Shopify). The shirt size is NOT a Shopify
// variant: it is attached to the line item as a property named "Size" so it shows on the order.
// Docs: https://shopify.dev/docs/apps/build/checkout/create-cart-permalinks (line item properties =
// a `properties` query param holding Base64 URL-encoded JSON, attached to the first product in the link).
//
// Optional overrides in Vercel > Settings > Environment Variables:
//   NEXT_PUBLIC_SHOP_DOMAIN   defaults to ra9equ-3p.myshopify.com
//   NEXT_PUBLIC_VARIANT_ID    defaults to 44528449191999
// These are public identifiers, not secrets. No Admin API token is used or needed here.
import { SIZES } from './shop'

const DOMAIN = process.env.NEXT_PUBLIC_SHOP_DOMAIN || 'ra9equ-3p.myshopify.com'
const VARIANT_ID = process.env.NEXT_PUBLIC_VARIANT_ID || '44528449191999'

export function checkoutUrl(size) {
  if (!SIZES.includes(size)) return ''
  const props = Buffer.from(JSON.stringify({ Size: size })).toString('base64url')
  return 'https://' + DOMAIN + '/cart/' + VARIANT_ID + ':1?properties=' + props
}
