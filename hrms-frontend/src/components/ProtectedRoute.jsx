import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/signin" replace />
  return <Outlet />
}

// Optional: wrap admin-only routes/tabs (e.g. Salary Info) with this.
export function AdminRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/signin" replace />
  if (user.role !== 'admin' && user.role !== 'hr') return <Navigate to="/" replace />
  return <Outlet />
}
