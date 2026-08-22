import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// GET /profile -> full profile object; tabs below are placeholders to
// fill in once backend teammate confirms field names for each tab.
const TABS = ['Resume', 'Private Info', 'Salary Info', 'Security']

export default function Profile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Resume')
  const isAdmin = user?.role === 'admin' || user?.role === 'hr'

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-avatar">{user?.name?.[0] ?? '?'}</div>
        <div>
          <h2>{user?.name}</h2>
          <p className="muted">{user?.loginId}</p>
        </div>
      </div>

      <div className="tab-row">
        {TABS.filter((t) => t !== 'Salary Info' || isAdmin).map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-panel">
        {activeTab === 'Resume' && <p className="muted">About, skills, and certifications go here.</p>}
        {activeTab === 'Private Info' && <p className="muted">DOB, address, bank details go here.</p>}
        {activeTab === 'Salary Info' && isAdmin && <p className="muted">Wage, salary components, PF go here.</p>}
        {activeTab === 'Security' && <p className="muted">Password change / login history go here.</p>}
      </div>
    </div>
  )
}
