'use client'
export default function GlobalError({ error }: { error: unknown }) {
  console.error(error)
  return (
    <html lang="es">
      <body className="min-h-dvh grid place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Algo salió mal</h1>
          <p className="opacity-80 text-sm">Intenta recargar la página.</p>
          <button onClick={()=>location.reload()} className="mt-4 px-4 py-2 rounded-lg border">Recargar</button>
        </div>
      </body>
    </html>
  )
}
