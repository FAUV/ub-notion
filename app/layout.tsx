import './globals.css'
import { PWAProvider } from './pwa-provider'
import AppUpdateToast from './app-update-toast'
import { ReactQueryProvider } from '@/lib/react-query/provider'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Ultimate Brain – Control Center',
  description: 'Suite nativa para Notion (UB)'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ub-notion" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <ReactQueryProvider>
          <PWAProvider>
            {children}
            <AppUpdateToast />
          </PWAProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
