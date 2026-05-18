import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Unoduno — Onde o viral se torna seu',
  description: 'Transforme videos virais americanos em conteudo adaptado para o mercado brasileiro com IA. Traducao neural, reconhecimento de padroes e engenharia de hooks.',
  generator: 'v0.app',
  openGraph: {
    title: 'Unoduno — Onde o viral se torna seu',
    description: 'Transforme videos virais americanos em conteudo adaptado para o mercado brasileiro com IA.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Unoduno',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unoduno — Onde o viral se torna seu',
    description: 'Transforme videos virais americanos em conteudo adaptado para o mercado brasileiro com IA.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrainsMono.variable} bg-background`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
