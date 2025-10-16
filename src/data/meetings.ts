import { useQuery } from '@tanstack/react-query'
import type { MeetingNote } from '../domain/types'
import { db } from './db'

export const meetingKeys = {
  all: ['meetings'] as const
}

async function getMeetings(): Promise<MeetingNote[]> {
  return db.meetings.orderBy('date').reverse().toArray()
}

export function useMeetingsQuery() {
  return useQuery({
    queryKey: meetingKeys.all,
    queryFn: getMeetings,
    staleTime: 60_000
  })
}
