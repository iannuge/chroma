'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import ProfileView from '../../../components/ProfileView'
import { useAuth } from '../../../components/AuthProvider'

export default function PublicProfile() {
  const params = useParams()
  const id = params ? params.id : null
  const { user } = useAuth()
  return (
    <main className="w page">
      <Link className="bk g" href="/">
        Back home
      </Link>
      {id ? <ProfileView key={id} uid={id} isMe={!!user && user.id === id} /> : null}
    </main>
  )
}
