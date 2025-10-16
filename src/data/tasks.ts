import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Task, TaskStatus } from '../domain/types'
import { db } from './db'
import { enqueue } from './outbox'

export const tasksKeys = {
  all: ['tasks'] as const
}

async function getAllTasks(): Promise<Task[]> {
  return db.tasks.orderBy('title').toArray()
}

export function useTasksQuery() {
  return useQuery({
    queryKey: tasksKeys.all,
    queryFn: getAllTasks,
    staleTime: 60_000
  })
}

async function updateTaskStatus({ id, status }: { id: string; status: TaskStatus }) {
  const current = await db.tasks.get(id)
  if (!current) {
    throw new Error('No se encontró la tarea a actualizar')
  }
  const updated: Task = { ...current, status }
  await db.tasks.put(updated)
  await enqueue({ type: 'task.upsert', payload: updated })
  return updated
}

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateTaskStatus,
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: tasksKeys.all })
      const previous = queryClient.getQueryData<Task[]>(tasksKeys.all)
      queryClient.setQueryData<Task[]>(tasksKeys.all, (old = []) =>
        old.map(task => (task.id === id ? { ...task, status } : task))
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(tasksKeys.all, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all })
    }
  })
}
