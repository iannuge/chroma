'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'
import ThemeToggle from './ThemeToggle'

export default function Nav() {
  const { user, ready, signIn, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const path = usePathname()
  const who = user && user.user_metadata ? user.user_metadata.full_name || user.email : ''

  useEffect(() => {
    setOpen(false)
  }, [path])

  const close = () => setOpen(false)
  const links = (
    <>
      <Link href="/archive" onClick={close}>
        Past drops
      </Link>
      <Link href="/#board" onClick={close}>
        Moodboard
      </Link>
      <Link href="/preorder" onClick={close}>
        Claim a shirt
      </Link>
      {user && (
        <Link href="/profile" onClick={close}>
          Profile
        </Link>
      )}
    </>
  )

  return (
    <div className="w navw">
      <nav className="g">
        <Link href="/" className="brand">
          <b>CHROMA</b>
        </Link>
        <span className="nl">
          <span className="dl">{links}</span>
          <button
            className="nbx"
            aria-label="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            Menu
          </button>
          {ready &&
            (user ? (
              <button className="pill" onClick={signOut} title={who}>
                Sign out
              </button>
            ) : (
              <button className="pill" onClick={signIn}>
                Sign in
              </button>
            ))}
        </span>
        <div className={'mm g' + (open ? ' open' : '')} aria-hidden={!open}>
          {links}
        </div>
      </nav>
      <ThemeToggle />
    </div>
  )
}
