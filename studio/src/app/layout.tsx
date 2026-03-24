import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'YOTEL Development Studio',
  description:
    'Enterprise-grade architectural design and development platform for hospitality projects',
  keywords: [
    'architecture',
    'development',
    'hotel',
    'YOTEL',
    'design',
    'Barbados',
    'Caribbean',
  ],
  openGraph: {
    title: 'YOTEL Development Studio',
    description:
      'Enterprise-grade architectural design and development platform for hospitality projects',
    type: 'website',
    siteName: 'YOTEL Development Studio',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'YOTEL Development Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YOTEL Development Studio',
    description:
      'Enterprise-grade architectural design and development platform for hospitality projects',
    images: ['/api/og'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased bg-slate-50">{children}</body>
    </html>
  )
}
