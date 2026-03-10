import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/hooks/use-cart'
import { Toaster } from '@/components/ui/toaster'
import { TRPCProvider } from '@/components/trpc-provider'
import { getResolvedGlobalConfig } from '@/lib/strapi'
import { GlobalConfigProvider } from '@/components/global-config-provider'
import { CookiePolicyBar } from '@/components/cookie-policy-bar'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export async function generateMetadata(): Promise<Metadata> {
  const config = await getResolvedGlobalConfig()
  return {
    title: `${config.siteName} - Streetwear & Skate`,
    description: config.siteDescription,
    icons: {
      icon: config.faviconUrl
        ? [{ url: config.faviconUrl }]
        : [
            { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
            { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
            { url: '/icon.svg', type: 'image/svg+xml' },
          ],
      apple: '/apple-icon.png',
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#6B8CFF',
  userScalable: true,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const config = await getResolvedGlobalConfig()

  const themeVars = `
    :root {
      --color-primary: ${config.theme.primary};
      --color-secondary: ${config.theme.secondary};
      --color-background: ${config.theme.background};
      --color-foreground: ${config.theme.foreground};
    }
  `

  return (
    <html lang="en" className="dark">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeVars }} />
      </head>
      <body className={`${spaceGrotesk.variable} ${geistMono.variable} font-sans antialiased`}>
        <TRPCProvider>
          <CartProvider>
            <GlobalConfigProvider config={config}>
              {children}
              <CookiePolicyBar />
            </GlobalConfigProvider>
            <Toaster />
            <Analytics />
          </CartProvider>
        </TRPCProvider>
      </body>
    </html>
  )
}
