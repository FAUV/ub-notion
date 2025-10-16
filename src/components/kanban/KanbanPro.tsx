
import { DndContext, useSensor, useSensors, PointerSensor, DragEndEvent, closestCorners, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'
import { useMemo, useCallback } from 'react'
import type { CSSProperties } from 'react'
import type { Task, TaskStatus } from '../../domain/types'

const STATUSES: TaskStatus[] = ['To Do','In Progress','Review','Done']

function TaskCard({task}:{task:Task}) {
  return (
    <div className="card p-3 text-sm">
      <div className="font-medium">{task.title}</div>
      <div className="text-xs opacity-60">{task.assignee ?? '—'} · {task.priority ?? '—'}</div>
    </div>
  )
}

interface ColumnData { type: 'column'; status: TaskStatus; lane: string }
interface TaskData { type: 'task'; task: Task; status: TaskStatus; lane: string }

function SortableItem({ task, lane }: { task: Task; lane: string }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable<TaskData>({
    id: task.id,
    data: { type: 'task', task, status: task.status, lane }
  })
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={clsx(isDragging && 'opacity-60')}>
      <TaskCard task={task} />
    </div>
  )
}

function KanbanColumn({ status, tasks, lane, limit }:
  { status: TaskStatus; tasks: Task[]; lane: string; limit?: number }) {
  const droppableId = `${lane || 'default'}::${status}`
  const { setNodeRef } = useDroppable<ColumnData>({ id: droppableId, data: { type: 'column', status, lane } })

  return (
    <div ref={setNodeRef} className="space-y-3">
      <div className="text-xs uppercase tracking-wide opacity-60">
        {status} {limit ? `(≤${limit})` : ''}
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map(task => (
            <SortableItem key={task.id} task={task} lane={lane} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export interface KanbanChangeMeta { from: TaskStatus; to: TaskStatus }

export function KanbanPro({ tasks, swimlaneBy, wip, onChange }:
  { tasks: Task[]; swimlaneBy?: 'assignee'|'type'|'projectId'; wip?: Partial<Record<TaskStatus, number>>; onChange?: (updated: Task, meta: KanbanChangeMeta)=>void }) {

  const lanes = useMemo(() => {
    if (!swimlaneBy) return { '': tasks }
    const m: Record<string, Task[]> = {}
    for (const t of tasks) {
      const key = String(t[swimlaneBy] ?? 'Sin asignar')
      m[key] = m[key] || []
      m[key].push(t)
    }
    return m
  }, [tasks, swimlaneBy])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current as TaskData | undefined
    const overData = over.data.current as TaskData | ColumnData | undefined

    if (!activeData) return

    const { task: draggedTask, status: fromStatus } = activeData
    const sourceLane = activeData.lane

    const targetStatus =
      overData?.type === 'task'
        ? overData.task.status
        : overData?.type === 'column'
          ? overData.status
          : undefined

    const targetLane =
      overData?.type === 'task'
        ? overData.lane
        : overData?.type === 'column'
          ? overData.lane
          : sourceLane

    if (!targetStatus || targetLane !== sourceLane) return
    if (targetStatus === fromStatus) return

    const limit = wip?.[targetStatus]
    if (limit) {
      const countTo = tasks.filter(t => t.status === targetStatus).length
      if (countTo >= limit) {
        alert(`WIP excedido en ${targetStatus} (límite ${limit})`)
        return
      }
    }

    const updatedTask: Task = { ...draggedTask, status: targetStatus }
    onChange?.(updatedTask, { from: fromStatus, to: targetStatus })
  }, [onChange, tasks, wip])

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="space-y-8">
        {Object.entries(lanes).map(([lane, items]) => (
          <section key={lane}>
            {swimlaneBy && <h3 className="text-sm font-medium mb-3 opacity-70">{swimlaneBy}: {lane}</h3>}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {STATUSES.map(status => (
                <KanbanColumn
                  key={`${lane || 'default'}::${status}`}
                  status={status}
                  tasks={items.filter(t => t.status === status)}
                  lane={lane}
                  limit={wip?.[status]}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </DndContext>
  )
}
