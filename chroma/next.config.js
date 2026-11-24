/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // lets /_next/image resize the moodboard images; the originals in storage are untouched
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/moodboard/**' }],
    formats: ['image/webp'],
    minimumCacheTTL: 2592000,
  },
}
module.exports = nextConfig
