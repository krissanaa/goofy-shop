import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, DM_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/hooks/use-cart'
import { Toaster } from '@/components/ui/toaster'
import { TRPCProvider } from '@/components/trpc-provider'
import { GlobalConfigProvider } from '@/components/global-config-provider'
import { PageTransitionShell } from '@/components/page-transition-shell'
import { RouteChrome } from '@/components/route-chrome'
import { defaultGlobalConfig } from '@/config/defaults'
import './globals.css'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-barlow-condensed',
})
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
})

export async function generateMetadata(): Promise<Metadata> {
  const config = defaultGlobalConfig
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
  themeColor: '#0A0A0A',
  userScalable: true,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const config = defaultGlobalConfig
  const watermarkText =
    config.siteDescription?.trim() || config.siteName || "GOOFY"

  const themeVars = `
    :root {
      --color-primary: ${config.theme.primary};
      --color-secondary: ${config.theme.secondary};
      --color-background: ${config.theme.background};
      --color-foreground: ${config.theme.foreground};
    }
  `

  return (
    <html lang="en" className="dark" data-theme="dark">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeVars }} />
      </head>
      <body className={`${barlowCondensed.variable} ${dmMono.variable} font-sans antialiased`}>
        <TRPCProvider>
          <CartProvider>
            <GlobalConfigProvider config={config}>
              <div className="relative min-h-screen">
                <RouteChrome watermarkText={watermarkText} />
                <div className="relative z-10">
                  <PageTransitionShell>{children}</PageTransitionShell>
                </div>
              </div>
            </GlobalConfigProvider>
            <Toaster />
            <Analytics />
          </CartProvider>
        </TRPCProvider>
      </body>
    </html>
  )
}
