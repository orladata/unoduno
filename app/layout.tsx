import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://unoduno.com'),
  title: {
    default: 'Unoduno — Onde o viral se torna seu',
    template: '%s | Unoduno',
  },
  description: 'Transforme vídeos virais americanos em conteúdo adaptado para o mercado brasileiro com IA. Tradução neural, reconhecimento de padrões e engenharia de hooks.',
  keywords: ['IA', 'YouTube', 'Tradução Neural', 'Criador de Conteúdo', 'Viral', 'Roteiro'],
  authors: [{ name: 'Unoduno' }],
  creator: 'Unoduno',
  publisher: 'Unoduno',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Unoduno — Onde o viral se torna seu',
    description: 'Transforme vídeos virais americanos em conteúdo adaptado para o mercado brasileiro com IA. Tradução neural e engenharia de hooks.',
    url: 'https://unoduno.com',
    siteName: 'Unoduno',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Unoduno Cover Image',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unoduno — Onde o viral se torna seu',
    description: 'Transforme vídeos virais americanos em conteúdo adaptado para o mercado brasileiro com IA.',
    creator: '@unoduno',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
  colorScheme: 'dark',
}

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} bg-background`}>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-violet-500/30 selection:text-white">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster theme="dark" position="top-right" />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
