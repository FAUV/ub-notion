'use client'
import Link from 'next/link'
export default function OfflinePage() {
  return (
    <main className="min-h-dvh grid place-items-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">You’re offline</h1>
        <p className="text-sm opacity-80">
          We couldn’t reach the network. Your last app shell is cached; some data may be unavailable.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={()=>location.reload()} className="px-4 py-2 rounded-lg border">Retry</button>
          <Link href="/" className="px-4 py-2 rounded-lg border">Go Home</Link>
        </div>
      </div>
    </main>
  )
}
