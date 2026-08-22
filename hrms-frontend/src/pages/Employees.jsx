import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

// GET /employees -> [{ id, name, avatarUrl, status: 'present' | 'leave' | 'absent' }]
// POST /employees body: { name, email, role, department, jobTitle }
//   -> auto-generates loginId as OI[Initials][Year][Serial] per sign-up note,
//      and (per spec 3.1.2/3.1) emails the new employee their credentials.

function StatusDot({ status }) {
  if (status === 'present') return <span className="status-dot status-present" title="Present" />
  if (status === 'leave') return <span className="status-dot status-leave" title="On leave">✈</span>
  return <span className="status-dot status-absent" title="Absent" />
}

function NewEmployeeModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'employee', department: '', jobTitle: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const { data } = await api.post('/employees', form)
      onCreated(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create employee.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>New Employee</h3>

        <label className="field-label">Full Name</label>
        <input className="field-input" required value={form.name}
          onChange={(e) => update('name', e.target.value)} />

        <label className="field-label">Email</label>
        <input type="email" className="field-input" required value={form.email}
          onChange={(e) => update('email', e.target.value)} />

        <label className="field-label">Job Title</label>
        <input className="field-input" value={form.jobTitle}
          onChange={(e) => update('jobTitle', e.target.value)} />

        <label className="field-label">Department</label>
        <input className="field-input" value={form.department}
          onChange={(e) => update('department', e.target.value)} />

        <label className="field-label">Role</label>
        <select className="field-input" value={form.role}
          onChange={(e) => update('role', e.target.value)}>
          <option value="employee">Employee</option>
          <option value="hr">HR / Admin</option>
        </select>

        <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
          A login ID and temporary password will be generated and emailed to the employee.
        </p>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="submit" className="btn-primary btn-small" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create'}
          </button>
          <button type="button" className="btn-secondary btn-small" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNew, setShowNew] = useState(false)

  function load() {
    setLoading(true)
    setError(null)
    api.get('/employees')
      .then((res) => setEmployees(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load employees.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-toolbar">
        <button className="btn-primary btn-small" onClick={() => setShowNew(true)}>NEW</button>
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
          <Link key={emp.id} to={`/employees/${emp.id}`} className="employee-card">
            <div className="employee-avatar">
              {emp.avatarUrl ? <img src={emp.avatarUrl} alt="" /> : <span>👤</span>}
              <StatusDot status={emp.status} />
            </div>
            <p className="employee-name">{emp.name}</p>
          </Link>
        ))}
      </div>

      {showNew && (
        <NewEmployeeModal
          onClose={() => setShowNew(false)}
          onCreated={(emp) => setEmployees((list) => [emp, ...list])}
        />
      )}
    </div>
  )
}
