'use client'

import { useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { useMoodboard } from './MoodboardProvider'

export default function AuthPrompt() {
  const { signIn } = useAuth()
  const { prompt, setPrompt } = useMoodboard()

  useEffect(() => {
    if (!prompt) return
    const key = (e) => {
      if (e.key === 'Escape') setPrompt(false)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [prompt, setPrompt])

  if (!prompt) return null

  return (
    <div className="lb apl" onClick={() => setPrompt(false)} role="dialog" aria-modal="true" aria-label="Sign in required">
      <div className="ap g" onClick={(e) => e.stopPropagation()}>
        <h3>you need an account</h3>
        <p>sign in with google to vote and add images to the moodboard. it only takes a second.</p>
        <div className="row2">
          <button className="pill" onClick={signIn}>
            Sign in with Google
          </button>
          <button className="pill ghost" onClick={() => setPrompt(false)}>
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
