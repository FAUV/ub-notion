
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../../components/nav/Sidebar'
import { Topbar } from '../../components/nav/Topbar'
import { UpdatePrompt } from './UpdatePrompt'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main id="main" className="flex-1">
          <div className="container-padded py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <UpdatePrompt />
    </div>
  )
}
