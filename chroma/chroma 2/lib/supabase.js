import { createClient } from '@supabase/supabase-js'

// These two values are public by design (they ship to every visitor's browser).
// Row level security in the database is what protects the data.
// You can override them with environment variables in Vercel if you ever need to.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slssmyekxnkyadqjptvu.supabase.co'
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_dVqM_tZssjfD8EFT8b9xhQ_amuQwD4C'

export const supabase = createClient(url, key)
