// Pre-order checkout settings. Set these in Vercel > Settings > Environment Variables:
//   NEXT_PUBLIC_SHOP_DOMAIN  your Shopify store address, e.g. yourstore.myshopify.com
//   NEXT_PUBLIC_VARIANT_S / _M / _L / _XL   the numeric variant ID for each size (Shopify > Product > each size)
// Or, if you only have one checkout link, set NEXT_PUBLIC_PREORDER_URL instead.
const DOMAIN = process.env.NEXT_PUBLIC_SHOP_DOMAIN || ''
const SINGLE = process.env.NEXT_PUBLIC_PREORDER_URL || ''
const VARIANTS = {
  S: process.env.NEXT_PUBLIC_VARIANT_S || '',
  M: process.env.NEXT_PUBLIC_VARIANT_M || '',
  L: process.env.NEXT_PUBLIC_VARIANT_L || '',
  XL: process.env.NEXT_PUBLIC_VARIANT_XL || '',
}

export const SIZES = ['S', 'M', 'L', 'XL']
const hasVariants = !!DOMAIN && SIZES.some((s) => VARIANTS[s])

export const shopOpen = hasVariants || !!SINGLE
// When only a single link is set, the size is picked on Shopify's page instead.
export const needsSize = hasVariants

export function checkoutUrl(size) {
  if (hasVariants && VARIANTS[size]) return 'https://' + DOMAIN + '/cart/' + VARIANTS[size] + ':1'
  return SINGLE
}
