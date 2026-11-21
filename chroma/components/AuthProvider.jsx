'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const Ctx = createContext({
  user: null,
  ready: false,
  authOpen: false,
  signIn() {},
  closeAuth() {},
  signInGoogle() {},
  signInEmail: async () => ({}),
  signUpEmail: async () => ({}),
  signOut() {},
})

export function useAuth() {
  return useContext(Ctx)
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session ? data.session.user : null)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? session.user : null)
      if (session) setAuthOpen(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // "signIn" opens the sign-in window (Google, or email and password).
  const signIn = () => setAuthOpen(true)
  const closeAuth = () => setAuthOpen(false)

  const signInGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

  const signInEmail = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? error.message : null }
  }

  const signUpEmail = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name }, emailRedirectTo: window.location.origin },
    })
    if (error) return { error: error.message }
    // With email confirmation on, there is no session until the link in the email is clicked.
    return { error: null, needsConfirm: !data.session }
  }

  const signOut = () => supabase.auth.signOut()

  return (
    <Ctx.Provider
      value={{ user, ready, authOpen, signIn, closeAuth, signInGoogle, signInEmail, signUpEmail, signOut }}
    >
      {children}
    </Ctx.Provider>
  )
}
