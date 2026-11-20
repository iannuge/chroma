import { supabase } from './supabase'

export const TONES = ['#f6b79c', '#d9d9d6', '#f2c200', '#6a6f7a', '#e8590c']

// The "secret" graphic that sits under the blur box on the tee.
export const HIDDEN_ART =
  'radial-gradient(circle at 28% 34%,#F24D11 0 24%,transparent 25%),' +
  'radial-gradient(circle at 74% 64%,#15130f 0 21%,transparent 22%),' +
  'repeating-linear-gradient(90deg,rgba(21,19,15,.9) 0 5%,transparent 5% 11%),' +
  'linear-gradient(135deg,#f6c2a4,#F24D11 58%,#8a2a08)'

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

export function fmtScore(n) {
  return String(Math.round(n * 10) / 10)
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
