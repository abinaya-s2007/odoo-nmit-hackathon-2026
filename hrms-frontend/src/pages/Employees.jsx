import { useEffect, useState } from 'react'
import api from '../api/client'

// GET /employees -> [{ id, name, avatarUrl, status: 'present' | 'leave' | 'absent' }]
const MOCK_EMPLOYEES = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  name: `Employee ${i + 1}`,
  avatarUrl: null,
  status: ['present', 'leave', 'absent'][i % 3]
}))

function StatusDot({ status }) {
  if (status === 'present') return <span className="status-dot status-present" title="Present" />
  if (status === 'leave') return <span className="status-dot status-leave" title="On leave">✈</span>
  return <span className="status-dot status-absent" title="Absent" />
}

export default function Employees() {
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/employees')
      .then((res) => setEmployees(res.data))
      .catch(() => console.warn('Using mock employee data — /employees not reachable yet.'))
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
