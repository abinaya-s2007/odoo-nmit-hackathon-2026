import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import logo from '../assets/logo.png'  

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)

  async function handleCheckToggle() {
    // POST /attendance/check-in  and  POST /attendance/check-out
    // Confirm the exact endpoint/body with your backend teammate.
    try {
      await api.post(checkedIn ? '/attendance/check-out' : '/attendance/check-in')
      setCheckedIn((v) => !v)
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update attendance. Try again.')
    }
  }

  function handleLogout() {
    logout()
    navigate('/signin')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-logo">
  <img src={logo} alt="Company logo" className="logo-img" />
</div>

        <nav className="topbar-tabs">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
            Employees
          </NavLink>
          <NavLink to="/attendance" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
            Attendance
          </NavLink>
          <NavLink to="/timeoff" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
            Time Off
          </NavLink>
        </nav>

        <div className="topbar-profile">
          <button
            className="avatar-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open profile menu"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="avatar-img" />
            ) : (
              <span className="avatar-fallback">{user?.name?.[0] ?? '?'}</span>
            )}
          </button>

          {menuOpen && (
            <div className="profile-menu" onMouseLeave={() => setMenuOpen(false)}>
              <button className="menu-item" onClick={handleCheckToggle}>
                {checkedIn ? 'Check Out ->' : 'Check IN ->'}
              </button>
              <NavLink to="/profile" className="menu-item" onClick={() => setMenuOpen(false)}>
                My Profile
              </NavLink>
              <button className="menu-item danger" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="page-body">
        <Outlet />
      </main>
    </div>
  )
}
