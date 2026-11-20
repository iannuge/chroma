import './globals.css'
import AuthProvider from '../components/AuthProvider'
import MoodboardProvider from '../components/MoodboardProvider'
import Nav from '../components/Nav'
import AuthPrompt from '../components/AuthPrompt'
import Aberration from '../components/Aberration'

export const metadata = {
  title: "chroma: designed by those who'll wear it",
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
            <footer className="w mu">chroma. designed by those who&apos;ll wear it.</footer>
          </MoodboardProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
