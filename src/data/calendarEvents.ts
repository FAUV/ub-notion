import { useQuery } from '@tanstack/react-query'
import type { CalendarEvent } from '../domain/types'
import { db } from './db'

export const calendarKeys = {
  all: ['calendar-events'] as const
}

async function getCalendarEvents(): Promise<CalendarEvent[]> {
  return db.calendar.orderBy('date').toArray()
}

export function useCalendarEventsQuery() {
  return useQuery({
    queryKey: calendarKeys.all,
    queryFn: getCalendarEvents,
    staleTime: 60_000
  })
}
