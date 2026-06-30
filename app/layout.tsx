import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { ConsentAnalytics } from '@/components/consent-analytics'
import './globals.css'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://lyashok.com'),
  title: {
    default: 'Alex Lyashok',
    template: '%s | Alex Lyashok',
  },
  description: 'Personal website and writing by Alex Lyashok.',
  alternates: { canonical: '/' },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {GA_MEASUREMENT_ID && (
          <ConsentAnalytics
            measurementId={GA_MEASUREMENT_ID}
            brand="lyashok.com"
            privacyPolicyUrl="/privacy"
          />
        )}
        <div className="site-shell">
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <header className="site-header">
            <div className="site-inner nav">
              <Link className="brand" href="/">
                Alex Lyashok
              </Link>
              <nav className="nav-links" aria-label="Primary">
                <Link href="/blog">Writing</Link>
                <Link href="/resume">Resume</Link>
                <Link href="/about">About</Link>
              </nav>
            </div>
          </header>
          <main id="main" className="site-inner main">
            {children}
          </main>
          <footer className="site-footer">
            <div className="site-inner footer-content">
              <span>lyashok.com</span>
              <a href="mailto:lyashok@gmail.com">lyashok@gmail.com</a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
