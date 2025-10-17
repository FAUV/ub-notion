export default function NotFound() {
  return (
    <main className="min-h-dvh grid place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Página no encontrada</h1>
        <p className="opacity-80 text-sm">Revisa la URL o vuelve al inicio.</p>
        <a href="/" className="inline-block mt-4 px-4 py-2 rounded-lg border">Inicio</a>
      </div>
    </main>
  )
}
