import './globals.css'
import AuthProvider from '../components/AuthProvider'
import MoodboardProvider from '../components/MoodboardProvider'
import Nav from '../components/Nav'

export const metadata = {
  title: 'CHROMA – designed by those who wear it',
  description: 'A crowd-sourced graphic tee. Submit, vote, and wear what the community designs.',
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
            <Nav />
            {children}
            <footer className="w mu">CHROMA. Designed by those who wear it.</footer>
          </MoodboardProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
