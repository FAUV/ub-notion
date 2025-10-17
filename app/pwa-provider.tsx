'use client'
import { useEffect, type PropsWithChildren } from 'react'
export function PWAProvider({ children }: PropsWithChildren) {
  useEffect(() => { if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(console.error) }, [])
  return <>{children}</>
}
