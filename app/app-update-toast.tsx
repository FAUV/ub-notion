'use client'
import { useEffect, useState } from 'react'
export default function AppUpdateToast() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      location.reload()
    })
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing
        if (!sw) return
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) setReady(true)
        })
      })
    })
  }, [])
  if (!ready) return null
  return (
    <div className="fixed bottom-4 inset-x-0 flex justify-center">
      <div className="rounded-xl border bg-white/85 backdrop-blur px-4 py-2 shadow">
        <span className="mr-3">A new version is available.</span>
        <button
          onClick={() => navigator.serviceWorker.getRegistration().then(r => r?.waiting?.postMessage({ type: "SKIP_WAITING" }))}
          className="px-3 py-1 rounded border"
        >Update</button>
      </div>
    </div>
  )
}
