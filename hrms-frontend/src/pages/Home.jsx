import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import Employees from './Employees'

// GET /dashboard/alerts -> [{ id, message, date }]
// Employee dashboard per spec 3.2.1: quick-access cards (Profile, Attendance,
// Leave Requests, Logout) + recent activity/alerts.
// Admin/HR dashboard per spec 3.2.2 is the employee directory itself, so we
// just render that page here to avoid duplicating it under two routes.

const CARDS = [
  { to: '/profile', icon: '👤', label: 'Profile', hint: 'View & edit your details' },
  { to: '/attendance', icon: '🕒', label: 'Attendance', hint: 'Check in/out, view history' },
  { to: '/timeoff', icon: '🌴', label: 'Leave Requests', hint: 'Apply & track time off' }
]

function EmployeeHome() {
  const { user, logout } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/dashboard/alerts')
      .then((res) => setAlerts(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load recent activity.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div>
        <h2 style={{ margin: '0 0 4px' }}>Welcome, {user?.name?.split(' ')[0] ?? 'there'}</h2>
        <p className="muted">Here's your quick access for today.</p>
      </div>

      <div className="dashboard-card-grid">
        {CARDS.map((c) => (
          <Link key={c.to} to={c.to} className="dashboard-card">
            <span className="dashboard-card-icon">{c.icon}</span>
            <span className="dashboard-card-label">{c.label}</span>
            <span className="dashboard-card-hint muted">{c.hint}</span>
          </Link>
        ))}
        <button className="dashboard-card dashboard-card-danger" onClick={logout}>
          <span className="dashboard-card-icon">⎋</span>
          <span className="dashboard-card-label">Logout</span>
          <span className="dashboard-card-hint muted">End your session</span>
        </button>
      </div>

      <div>
        <h3 style={{ marginBottom: 8 }}>Recent activity</h3>
        {loading && <p className="muted">Loading...</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && alerts.length === 0 && (
          <p className="muted">Nothing new right now.</p>
        )}
        {!loading && !error && alerts.length > 0 && (
          <ul className="activity-list">
            {alerts.map((a) => (
              <li key={a.id} className="activity-item">
                <span>{a.message}</span>
                <span className="muted">{a.date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'hr'
  return isAdmin ? <Employees /> : <EmployeeHome />
}
