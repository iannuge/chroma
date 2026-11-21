'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'
import { useMoodboard } from './MoodboardProvider'

export default function AuthPrompt() {
  const { authOpen, closeAuth, signInGoogle, signInEmail, signUpEmail } = useAuth()
  const { prompt, setPrompt } = useMoodboard()
  const open = prompt || authOpen
  const [mode, setMode] = useState('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const close = () => {
    setPrompt(false)
    closeAuth()
    setMsg('')
  }

  useEffect(() => {
    if (!open) return
    const key = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    if (mode === 'up' && !name.trim()) {
      setMsg('Add a display name. It shows next to your images.')
      return
    }
    if (mode === 'up' && password.length < 8) {
      setMsg('Use a password with at least 8 characters.')
      return
    }
    setBusy(true)
    const r =
      mode === 'in'
        ? await signInEmail(email.trim(), password)
        : await signUpEmail(email.trim(), password, name.trim())
    setBusy(false)
    if (r.error) setMsg(r.error)
    else if (r.needsConfirm) setMsg('Check your email for a link to confirm your account, then sign in.')
    else close()
  }

  return (
    <div className="lb apl" onClick={close} role="dialog" aria-modal="true" aria-label="Sign in">
      <div className="ap g" onClick={(e) => e.stopPropagation()}>
        <h3>{mode === 'in' ? 'sign in' : 'create an account'}</h3>
        <p>you need an account to vote and add images to the moodboard.</p>
        <button className="pill" onClick={signInGoogle} type="button">
          Continue with Google
        </button>
        <div className="or mu">or use email</div>
        <form className="authf" onSubmit={submit}>
          {mode === 'up' && (
            <input
              type="text"
              placeholder="Display name"
              aria-label="Display name"
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              autoComplete="nickname"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            aria-label="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            aria-label="Password"
            required
            minLength={mode === 'up' ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          />
          {msg && (
            <p className="mu authm" role="status">
              {msg}
            </p>
          )}
          <button className="pill" disabled={busy}>
            {busy ? 'One sec…' : mode === 'in' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <div className="row2">
          <button
            className="pill ghost"
            type="button"
            onClick={() => {
              setMode(mode === 'in' ? 'up' : 'in')
              setMsg('')
            }}
          >
            {mode === 'in' ? 'New here? Create an account' : 'Have an account? Sign in'}
          </button>
          <button className="pill ghost" type="button" onClick={close}>
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
