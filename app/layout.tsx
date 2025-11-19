import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'Course Platform - Learn Anything, Anywhere',
    template: '%s | Course Platform',
  },
  description:
    'Next-generation online learning platform with AI-powered features, interactive courses, and gamification',
  keywords: [
    'online courses',
    'learning platform',
    'education',
    'e-learning',
    'AI tutoring',
  ],
  authors: [{ name: 'Course Platform' }],
  creator: 'Course Platform',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    siteName: 'Course Platform',
    title: 'Course Platform - Learn Anything, Anywhere',
    description:
      'Next-generation online learning platform with AI-powered features',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Course Platform',
    description: 'Next-generation online learning platform',
    creator: '@courseplatform',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          jetbrainsMono.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
