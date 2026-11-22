import { supabase } from './supabase'

export const TONES = ['#f6b79c', '#d9d9d6', '#f2c200', '#6a6f7a', '#e8590c']

export function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function lum(c) {
  const n = parseInt((c || '#d9d9d6').slice(1), 16)
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
}

export function imgUrl(path) {
  if (!path) return null
  return supabase.storage.from('moodboard').getPublicUrl(path).data.publicUrl
}

// Small display copy for the home page cards (resized and cached by Vercel); originals stay full quality in storage.
export function thumbUrl(url, w = 384) {
  if (!url || !/^https:\/\/[^/]+\.supabase\.co\/storage\//.test(url)) return url
  return '/_next/image?url=' + encodeURIComponent(url) + '&w=' + w + '&q=80'
}

// Votes are weighted behind the scenes; show the closest whole number.
export function fmtScore(n) {
  return String(Math.round(n))
}

// Shrinks a photo in the browser before upload so storage stays small and pages load fast.
export function resizeToJpeg(file, max = 900) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that image'))
    reader.onload = () => {
      const im = new Image()
      im.onerror = () => reject(new Error('That file is not a usable image'))
      im.onload = () => {
        const s = Math.min(1, max / Math.max(im.width, im.height))
        const c = document.createElement('canvas')
        c.width = Math.round(im.width * s)
        c.height = Math.round(im.height * s)
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height)
        c.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Could not resize the image'))),
          'image/jpeg',
          0.82
        )
      }
      im.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
