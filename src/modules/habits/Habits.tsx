import { useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { useHabitsQuery } from '../../data/habits'

export default function Habits() {
  const { data: habits = [], isLoading } = useHabitsQuery()

  const chartData = useMemo(() => habits.map(habit => ({ name: habit.title, streak: habit.streak ?? 0 })), [habits])

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Hábitos & Rituales</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Haz seguimiento de tus sistemas recurrentes como en Ultimate Brain: streaks, cadencia y foco por área.</p>
      </header>

      {isLoading ? (
        <div className="card p-4 text-sm text-slate-500 dark:text-slate-400">Cargando hábitos...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-4">
            <h2 className="text-sm font-semibold mb-3">Streaks actuales</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={180} />
                  <Tooltip />
                  <Bar dataKey="streak" fill="#0ea5e9" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-0 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Hábito</th>
                  <th className="px-4 py-3 font-medium">Cadencia</th>
                  <th className="px-4 py-3 font-medium">Métrica</th>
                  <th className="px-4 py-3 font-medium">Racha</th>
                  <th className="px-4 py-3 font-medium">Último check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {habits.map(habit => (
                  <tr key={habit.id}>
                    <td className="px-4 py-3 font-medium">{habit.title}</td>
                    <td className="px-4 py-3">{habit.cadence}</td>
                    <td className="px-4 py-3">{habit.metric ?? '—'}</td>
                    <td className="px-4 py-3">{habit.streak ?? 0}</td>
                    <td className="px-4 py-3">{habit.lastChecked ?? '—'}</td>
                  </tr>
                ))}
                {!habits.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">No hay hábitos configurados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
