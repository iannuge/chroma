// Client-safe pre-order settings. The Shopify link itself is built on the server (lib/shop.server.js)
// and only handed out through /api/preorder after the pre-order password is checked.
export const SIZES = ['S', 'M', 'L', 'XL']
export const shopOpen = true
// A size is always required before checkout.
export const needsSize = true
export const MAX_QTY = 10
