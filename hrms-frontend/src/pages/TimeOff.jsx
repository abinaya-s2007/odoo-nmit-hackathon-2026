import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

// Employee (3.5.1):
//   GET  /timeoff/balance -> { paid: number, sick: number }
//   POST /timeoff/request body: { type, startDate, endDate, allocationDays, attachment? }
// Admin/HR (3.5.2):
//   GET   /timeoff/requests -> [{ id, employeeName, type, startDate, endDate, status, remarks }]
//   PATCH /timeoff/requests/:id body: { status: 'approved' | 'rejected', comment }

function EmployeeTimeOff() {
  const [balance, setBalance] = useState(null)
  const [balanceError, setBalanceError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ type: 'Paid time off', startDate: '', endDate: '', allocationDays: 1, remarks: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    api.get('/timeoff/balance')
      .then((res) => setBalance(res.data))
      .catch((err) => setBalanceError(err.response?.data?.message || 'Could not load balance.'))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      await api.post('/timeoff/request', form)
      setShowModal(false)
      setForm({ type: 'Paid time off', startDate: '', endDate: '', allocationDays: 1, remarks: '' })
      const res = await api.get('/timeoff/balance')
      setBalance(res.data)
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Could not submit the request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <button className="btn-primary btn-small" onClick={() => setShowModal(true)}>NEW</button>
      </div>

      {balanceError && <p className="form-error">{balanceError}</p>}

      <div className="balance-row">
        <div className="balance-card">
          <p className="balance-label">Paid time Off</p>
          <p className="balance-value">{balance ? `${balance.paid} Days Available` : '—'}</p>
        </div>
        <div className="balance-card">
          <p className="balance-label">Sick time off</p>
          <p className="balance-value">{balance ? `${balance.sick} Days Available` : '—'}</p>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h3>Time off Type Request</h3>

            <label className="field-label">Time off Type</label>
            <select className="field-input" value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option>Paid time off</option>
              <option>Sick Leave</option>
              <option>Unpaid Leaves</option>
            </select>

            <label className="field-label">Validity Period</label>
            <div className="field-row">
              <input type="date" className="field-input" required
                value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              <span>To</span>
              <input type="date" className="field-input" required
                value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </div>

            <label className="field-label">Allocation (days)</label>
            <input type="number" min="1" className="field-input"
              value={form.allocationDays} onChange={(e) => setForm((f) => ({ ...f, allocationDays: e.target.value }))} />

            <label className="field-label">Remarks</label>
            <input className="field-input" placeholder="Optional"
              value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} />

            {submitError && <p className="form-error">{submitError}</p>}

            <div className="modal-actions">
              <button type="submit" className="btn-primary btn-small" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
              <button type="button" className="btn-secondary btn-small" onClick={() => setShowModal(false)}>
                Discard
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function StatusPill({ status }) {
  const cls = status === 'approved' ? 'pill-approved' : status === 'rejected' ? 'pill-rejected' : 'pill-pending'
  return <span className={`status-pill ${cls}`}>{status}</span>
}

function AdminTimeOff() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [comment, setComment] = useState({})
  const [actingId, setActingId] = useState(null)

  function load() {
    setLoading(true)
    setError(null)
    api.get('/timeoff/requests')
      .then((res) => setRequests(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load leave requests.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function decide(id, status) {
    setActingId(id)
    try {
      const { data } = await api.patch(`/timeoff/requests/${id}`, { status, comment: comment[id] || '' })
      setRequests((list) => list.map((r) => (r.id === id ? data : r)))
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update this request.')
    } finally {
      setActingId(null)
    }
  }

  const filtered = requests.filter((r) => filter === 'all' || r.status === filter)

  return (
    <div className="page">
      <div className="page-toolbar">
        <select className="field-input" style={{ maxWidth: 180 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>

      {loading && <p className="muted">Loading leave requests...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p className="muted">No {filter !== 'all' ? filter : ''} requests.</p>}

      {!loading && !error && filtered.length > 0 && (
        <div className="leave-list">
          {filtered.map((r) => (
            <div key={r.id} className="leave-request-card">
              <div className="leave-request-top">
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{r.employeeName}</p>
                  <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>
                    {r.type} &middot; {r.startDate} to {r.endDate}
                  </p>
                </div>
                <StatusPill status={r.status} />
              </div>

              {r.remarks && <p className="muted" style={{ fontSize: 13 }}>"{r.remarks}"</p>}

              {r.status === 'pending' && (
                <div className="leave-request-actions">
                  <input
                    className="field-input"
                    placeholder="Add a comment (optional)"
                    value={comment[r.id] || ''}
                    onChange={(e) => setComment((c) => ({ ...c, [r.id]: e.target.value }))}
                  />
                  <button className="btn-primary btn-small" disabled={actingId === r.id}
                    onClick={() => decide(r.id, 'approved')}>Approve</button>
                  <button className="btn-secondary btn-small" disabled={actingId === r.id}
                    onClick={() => decide(r.id, 'rejected')}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TimeOff() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'hr'
  return isAdmin ? <AdminTimeOff /> : <EmployeeTimeOff />
}
