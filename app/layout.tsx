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
                <Link href="/about">About</Link>
                <a
                  className="social-link"
                  href="https://www.linkedin.com/in/lyashok/"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.32 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.54V9H7.1v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
                  </svg>
                </a>
                <a
                  className="social-link"
                  href="https://x.com/alyashok"
                  aria-label="X"
                  title="X"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M18.9 1.16h3.68l-8.04 9.19L24 22.84h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.16h7.59l5.23 6.92 6.08-6.92Zm-1.29 19.48h2.04L6.48 3.25H4.29l13.32 17.39Z" />
                  </svg>
                </a>
              </nav>
            </div>
          </header>
          <main id="main" className="site-inner main">
            {children}
          </main>
          <footer className="site-footer">
            <div className="site-inner footer-content">
              <span>lyashok.com</span>
              <span aria-label="Email: lyashok at gmail dot com">
                lyashok [at] gmail [dot] com
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
