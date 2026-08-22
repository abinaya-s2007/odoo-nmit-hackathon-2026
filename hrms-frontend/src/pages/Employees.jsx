import { useEffect, useState } from 'react'
import api from '../api/client'

// GET /employees -> [{ id, name, avatarUrl, status: 'present' | 'leave' | 'absent' }]

function StatusDot({ status }) {
  if (status === 'present') return <span className="status-dot status-present" title="Present" />
  if (status === 'leave') return <span className="status-dot status-leave" title="On leave">✈</span>
  return <span className="status-dot status-absent" title="Absent" />
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.get('/employees')
      .then((res) => setEmployees(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load employees.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-toolbar">
        <button className="btn-primary btn-small">NEW</button>
        <input
          className="search-input"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <p className="muted">Loading employees...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="muted">No employees found.</p>
      )}

      <div className="employee-grid">
        {filtered.map((emp) => (
          <div key={emp.id} className="employee-card">
            <div className="employee-avatar">
              {emp.avatarUrl ? <img src={emp.avatarUrl} alt="" /> : <span>👤</span>}
              <StatusDot status={emp.status} />
            </div>
            <p className="employee-name">{emp.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
