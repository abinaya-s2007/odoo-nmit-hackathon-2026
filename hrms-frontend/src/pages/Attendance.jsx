import { useEffect, useState } from 'react'
import api from '../api/client'

// GET /attendance?date=YYYY-MM-DD
// -> [{ employeeName, checkIn, checkOut, workHours, extraHours }]
const MOCK_ROWS = [
  { employeeName: 'Employee 1', checkIn: '10:00', checkOut: '19:00', workHours: '09:00', extraHours: '01:00' },
  { employeeName: 'Employee 2', checkIn: '10:00', checkOut: '19:00', workHours: '09:00', extraHours: '01:00' }
]

export default function Attendance() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [rows, setRows] = useState(MOCK_ROWS)

  useEffect(() => {
    api.get('/attendance', { params: { date } })
      .then((res) => setRows(res.data))
      .catch(() => console.warn('Using mock attendance data — /attendance not reachable yet.'))
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
    </div>
  )
}
