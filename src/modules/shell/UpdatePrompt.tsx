
import { useEffect, useState } from 'react'
export function UpdatePrompt() {
  const [needsRefresh, setNeedsRefresh] = useState(false)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload())
      navigator.serviceWorker.ready.then((reg) => { if (reg.waiting) setNeedsRefresh(true) })
    }
  }, [])
  if (!needsRefresh) return null
  return (
    <div className="fixed bottom-4 right-4 card p-4">
      <div className="text-sm mb-2">Hay una actualización disponible.</div>
      <button className="btn" onClick={() => navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.waiting?.postMessage({ type: 'SKIP_WAITING' })))}>Actualizar</button>
    </div>
  )
}
