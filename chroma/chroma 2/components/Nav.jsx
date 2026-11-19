'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { useMoodboard } from './MoodboardProvider'

export default function Nav() {
  const { user, ready, signIn, signOut } = useAuth()
  const { drop } = useMoodboard()
  const label = drop
    ? 'Drop ' + String(drop.number).padStart(2, '0') + ', theme: “' + drop.theme + '”'
    : ''
  const who = user && user.user_metadata ? user.user_metadata.full_name || user.email : ''

  return (
    <div className="w">
      <nav className="g">
        <Link href="/" className="brand">
          <b>CHROMA</b>
        </Link>
        <span className="mu navmid">{label}</span>
        <span className="nl">
          <Link href="/archive">Past drops</Link>
          <Link href="/#board">Moodboard</Link>
          {user && <Link href="/profile">Profile</Link>}
          {ready &&
            (user ? (
              <button className="pill" onClick={signOut} title={who}>
                Sign out
              </button>
            ) : (
              <button className="pill" onClick={signIn}>
                Sign in with Google
              </button>
            ))}
        </span>
      </nav>
    </div>
  )
}
