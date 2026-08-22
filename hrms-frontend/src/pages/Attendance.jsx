import { useEffect, useState } from 'react'
import api from '../api/client'

// GET /attendance?date=YYYY-MM-DD
// -> [{ employeeName, checkIn, checkOut, workHours, extraHours }]

export default function Attendance() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.get('/attendance', { params: { date } })
      .then((res) => setRows(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load attendance.'))
      .finally(() => setLoading(false))
  }, [date])

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
              <th>Employee</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Work Hours</th>
              <th>Extra Hours</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.employeeName}</td>
                <td>{r.checkIn}</td>
                <td>{r.checkOut}</td>
                <td>{r.workHours}</td>
                <td>{r.extraHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
