
import React, { Suspense, lazy, type LazyExoticComponent, type ComponentType } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import './utils/i18n'
import { queryClient } from './data/queryClient'
import { initTheme } from './utils/theme'
import { seedDatabase } from './data/seed'
import { scheduleSync } from './data/syncEngine'

const App = lazy(() => import('./modules/shell/App'))
const Dashboard = lazy(() => import('./modules/dashboard/Dashboard'))
const Projects = lazy(() => import('./modules/projects/Projects'))
const Tasks = lazy(() => import('./modules/tasks/Tasks'))
const Sprints = lazy(() => import('./modules/sprints/Sprints'))
const Studies = lazy(() => import('./modules/studies/Studies'))
const Content = lazy(() => import('./modules/content/Content'))
const DailyPlanner = lazy(() => import('./modules/daily/DailyPlanner'))
const WeeklyReview = lazy(() => import('./modules/weekly/WeeklyReview'))
const Areas = lazy(() => import('./modules/areas/Areas'))
const Goals = lazy(() => import('./modules/goals/Goals'))
const Habits = lazy(() => import('./modules/habits/Habits'))
const Knowledge = lazy(() => import('./modules/knowledge/Knowledge'))
const CRM = lazy(() => import('./modules/crm/CRM'))
const Journal = lazy(() => import('./modules/journal/Journal'))
const Meetings = lazy(() => import('./modules/meetings/Meetings'))
const UltimateCalendar = lazy(() => import('./modules/calendar/UltimateCalendar'))

const ShellFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-300">
    Cargando interfaz...
  </div>
)

const PageFallback = () => (
  <div className="flex h-full items-center justify-center py-10">
    <span className="text-sm text-slate-500 dark:text-slate-400">Cargando vista...</span>
  </div>
)

type LazyComponent = LazyExoticComponent<ComponentType>

function withSuspense(Component: LazyComponent, fallback: JSX.Element) {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  )
}

initTheme()
if (typeof window !== 'undefined') {
  scheduleSync()
}

const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(App, <ShellFallback />),
    children: [
      { index: true, element: withSuspense(Dashboard, <PageFallback />) },
      { path: 'daily', element: withSuspense(DailyPlanner, <PageFallback />) },
      { path: 'weekly-review', element: withSuspense(WeeklyReview, <PageFallback />) },
      { path: 'areas', element: withSuspense(Areas, <PageFallback />) },
      { path: 'goals', element: withSuspense(Goals, <PageFallback />) },
      { path: 'projects', element: withSuspense(Projects, <PageFallback />) },
      { path: 'tasks', element: withSuspense(Tasks, <PageFallback />) },
      { path: 'sprints', element: withSuspense(Sprints, <PageFallback />) },
      { path: 'habits', element: withSuspense(Habits, <PageFallback />) },
      { path: 'calendar', element: withSuspense(UltimateCalendar, <PageFallback />) },
      { path: 'studies', element: withSuspense(Studies, <PageFallback />) },
      { path: 'content', element: withSuspense(Content, <PageFallback />) },
      { path: 'knowledge', element: withSuspense(Knowledge, <PageFallback />) },
      { path: 'crm', element: withSuspense(CRM, <PageFallback />) },
      { path: 'journal', element: withSuspense(Journal, <PageFallback />) },
      { path: 'meetings', element: withSuspense(Meetings, <PageFallback />) }
    ]
  }
])

async function bootstrap() {
  try {
    await seedDatabase()
  } catch (error) {
    console.error('No se pudo inicializar la base de datos local', error)
  }

  const container = document.getElementById('root')
  if (!container) throw new Error('No se encontró el contenedor #root')

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>
  )
}

void bootstrap()
