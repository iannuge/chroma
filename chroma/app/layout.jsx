import './globals.css'
import AuthProvider from '../components/AuthProvider'
import MoodboardProvider from '../components/MoodboardProvider'
import Nav from '../components/Nav'
import AuthPrompt from '../components/AuthPrompt'
import Aberration from '../components/Aberration'
import Link from 'next/link'

export const metadata = {
  title: "chroma: crowdsourced art direction on a graphic tee",
  description: 'a crowd-sourced graphic tee. vote for the cluster that becomes the shirt, then wear what the community designs.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <MoodboardProvider>
            <Aberration />
            <Nav />
            <AuthPrompt />
            {children}
            <footer className="w mu">
              <Link href="/" className="sqf" aria-label="back to top of home page">
                <i />
                <i />
                <i />
              </Link>
              chroma. crowdsourced art direction on a graphic tee. <Link href="/terms">terms</Link>{' '}
              <Link href="/privacy">privacy</Link> <Link href="/copyright">copyright</Link>
            </footer>
          </MoodboardProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
