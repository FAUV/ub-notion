
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import type { TooltipProps } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import { fmt, toTs } from '../../utils/date'

export interface TimelineItem {
  id: string
  name: string
  startDate: string
  endDate: string
  category?: string
}

interface TimelineDatum {
  id: string
  name: string
  start: number
  end: number
  duration: number
  startLabel: string
  endLabel: string
  category?: string
}

interface TimelineProps {
  items: TimelineItem[]
  emptyMessage?: string
}

export function Timeline({ items, emptyMessage = 'No hay elementos con fechas definidas.' }: TimelineProps) {
  const data = items
    .filter(item => item.startDate && item.endDate)
    .map<TimelineDatum>(item => {
      const start = toTs(item.startDate)!
      const end = toTs(item.endDate)!
      const duration = Math.max((end - start) / (1000 * 3600 * 24), 0)
      return {
        id: item.id,
        name: item.name,
        start,
        end,
        duration,
        startLabel: fmt(item.startDate),
        endLabel: fmt(item.endDate),
        category: item.category
      }
    })

  if (!data.length) {
    return <div className="card p-4 text-sm opacity-80">{emptyMessage}</div>
  }

  const formatTooltip: TooltipProps<ValueType, NameType>['formatter'] = (value, name) => {
    if (name === 'duration' && typeof value === 'number') {
      return [`${Math.round(value)} días`, 'Duración']
    }
    return [value ?? '', name ?? '']
  }

  const formatLabel: TooltipProps<ValueType, NameType>['labelFormatter'] = (_, payload) => {
    const item = (payload?.[0]?.payload ?? null) as TimelineDatum | null
    if (!item) return ''
    const range = `${item.startLabel} → ${item.endLabel}`
    return item.category ? `${item.category} · ${range}` : range
  }

  return (
    <div className="card p-4">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 120 }}>
            <XAxis type="number" hide domain={[dataMin => dataMin, dataMax => dataMax]} />
            <YAxis type="category" dataKey="name" width={260} />
            <Tooltip formatter={formatTooltip} labelFormatter={formatLabel} />
            <Bar dataKey="duration" radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
