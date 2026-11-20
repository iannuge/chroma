import './globals.css'
import AuthProvider from '../components/AuthProvider'
import MoodboardProvider from '../components/MoodboardProvider'
import Nav from '../components/Nav'
import AuthPrompt from '../components/AuthPrompt'

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
            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
              <filter id="ca" x="-3%" y="-3%" width="106%" height="106%" colorInterpolationFilters="sRGB">
                <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
                <feOffset in="r" dx="-2" dy="0" result="ro" />
                <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
                <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
                <feOffset in="b" dx="2" dy="0" result="bo" />
                <feBlend in="ro" in2="g" mode="screen" result="rg" />
                <feBlend in="rg" in2="bo" mode="screen" />
              </filter>
            </svg>
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
