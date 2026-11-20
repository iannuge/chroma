# CHROMA

Next.js site for the CHROMA crowd-sourced tee brand. Data, login and image storage run on Supabase.

## Deploy (no installs needed)
1. Create a GitHub repository and upload everything in this folder to it.
2. In Vercel, choose Add New > Project, import that repository, and click Deploy.
3. After it deploys, add your site address to Supabase (Authentication > URL Configuration):
   - Site URL: your Vercel address
   - Redirect URLs: your Vercel address with /** on the end
4. Add the same address under "Authorized JavaScript origins" in your Google OAuth client.

## Optional settings (Vercel > Settings > Environment Variables)
- Shopify checkout is set in `lib/shop.js` (store + single variant ID). Optional overrides: `NEXT_PUBLIC_SHOP_DOMAIN`, `NEXT_PUBLIC_VARIANT_ID`. Size is sent as a line item property named "Size".
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: only to override the defaults in `lib/supabase.js`

## Database
`sql/schema.sql` creates the tables (already run). If your database was set up before the images-only change, run `sql/migrate-images-only.sql` once. `sql/seed.sql` is an optional starter moodboard.

## Run locally (optional, needs Node.js)
`npm install` then `npm run dev`, then open http://localhost:3000
