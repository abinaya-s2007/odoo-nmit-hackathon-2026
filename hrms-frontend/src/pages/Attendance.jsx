import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

// Admin/HR (3.4.2 "view attendance of all employees"):
//   GET /attendance?date=YYYY-MM-DD -> [{ employeeName, checkIn, checkOut, workHours, extraHours, status }]
// Employee (3.4.2 "can view only their own attendance"):
//   GET /attendance/me?date=YYYY-MM-DD -> same shape, single-employee scope

export default function Attendance() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'hr'

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const endpoint = isAdmin ? '/attendance' : '/attendance/me'
    api.get(endpoint, { params: { date } })
      .then((res) => setRows(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load attendance.'))
      .finally(() => setLoading(false))
  }, [date, isAdmin])

  return (
    <div className="page">
      <div className="page-toolbar">
        <input
          type="date"
          className="search-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {loading && <p className="muted">Loading attendance...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="muted">No attendance records for this date.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              {isAdmin && <th>Employee</th>}
              <th>Check In</th>
              <th>Check Out</th>
              <th>Work Hours</th>
              <th>Extra Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {isAdmin && <td>{r.employeeName}</td>}
                <td>{r.checkIn || '—'}</td>
                <td>{r.checkOut || '—'}</td>
                <td>{r.workHours ?? '—'}</td>
                <td>{r.extraHours ?? '—'}</td>
                <td>{r.status ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
