
import { useState, type ChangeEvent } from 'react'
import type { TaskStatus } from '../../domain/types'

export interface TaskFilters {
  q?: string
  status?: TaskStatus | 'All'
  assignee?: string | 'All'
}

export interface FilterBarProps {
  onChange: (filters: TaskFilters) => void
}

export function FilterBar({ onChange }: FilterBarProps) {
  const [q, setQ] = useState<string>('') 
  const [status, setStatus] = useState<TaskStatus | 'All'>('All')
  const [assignee, setAssignee] = useState<string | 'All'>('All')

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextQuery = event.target.value
    setQ(nextQuery)
    onChange({ q: nextQuery, status, assignee })
  }

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as TaskStatus | 'All'
    setStatus(value)
    onChange({ q, status: value, assignee })
  }

  const handleAssigneeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim()
    const nextAssignee = value === '' ? 'All' : value
    setAssignee(nextAssignee)
    onChange({ q, status, assignee: nextAssignee })
  }

  return (
    <div className="card p-3 flex flex-wrap gap-2 items-center">
      <input className="input" placeholder="Buscar..." value={q} onChange={handleSearchChange} />
      <select className="input" value={status} onChange={handleStatusChange}>
        <option value="All">Todos</option>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Review">Review</option>
        <option value="Done">Done</option>
        <option value="Blocked">Blocked</option>
        <option value="Archived">Archived</option>
      </select>
      <input className="input" placeholder="Responsable" value={assignee === 'All' ? '' : assignee} onChange={handleAssigneeChange} />
    </div>
  )
}
