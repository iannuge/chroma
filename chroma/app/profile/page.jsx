'use client'

import Link from 'next/link'
import ProfileView from '../../components/ProfileView'
import { useAuth } from '../../components/AuthProvider'

export default function MyProfile() {
  const { user, ready, signIn } = useAuth()
  return (
    <main className="w page">
      <Link className="bk g" href="/">
        Back home
      </Link>
      {!ready ? (
        <p className="mu">Loading…</p>
      ) : user ? (
        <ProfileView uid={user.id} isMe />
      ) : (
        <div>
          <p className="mu">Sign in to see your profile.</p>
          <button className="pill" onClick={signIn}>
            Sign in
          </button>
        </div>
      )}
    </main>
  )
}
