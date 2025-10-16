
import { parseISO, differenceInDays, addDays, format } from 'date-fns'
export const toTs = (d?: string) => (d ? parseISO(d).getTime() : undefined)
export const daysBetween = (a?: string, b?: string) => (a && b ? differenceInDays(parseISO(b), parseISO(a)) : undefined)
export const addDaysStr = (d: string, n: number) => format(addDays(parseISO(d), n), 'yyyy-MM-dd')
export const fmt = (d?: string) => (d ? format(parseISO(d), 'yyyy-MM-dd') : '')
