import './globals.css'
import AuthProvider from '../components/AuthProvider'
import MoodboardProvider from '../components/MoodboardProvider'
import Nav from '../components/Nav'
import AuthPrompt from '../components/AuthPrompt'
import Aberration from '../components/Aberration'
import Backdrop from '../components/Backdrop'
import PageReveal from '../components/PageReveal'
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('chroma-theme')==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}",
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <MoodboardProvider>
            <Backdrop />
            <Aberration />
            <Nav />
            <AuthPrompt />
            <PageReveal>{children}</PageReveal>
            <footer className="w mu">
              chroma. crowdsourced art direction on a graphic tee. <Link href="/terms">terms</Link>{' '}
              <Link href="/privacy">privacy</Link> <Link href="/copyright">copyright</Link>
            </footer>
          </MoodboardProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
