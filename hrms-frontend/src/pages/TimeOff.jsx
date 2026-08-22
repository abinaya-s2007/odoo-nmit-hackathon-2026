import { useState } from 'react'
import api from '../api/client'

// GET /timeoff/balance -> { paid: number, sick: number }
// POST /timeoff/request body: { type, startDate, endDate, allocationDays, attachment? }
export default function TimeOff() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ type: 'Paid time off', startDate: '', endDate: '', allocationDays: 1 })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/timeoff/request', form)
    } catch {
      console.warn('/timeoff/request not reachable yet — closing modal anyway for demo.')
    } finally {
      setSubmitting(false)
      setShowModal(false)
    }
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <button className="btn-primary btn-small" onClick={() => setShowModal(true)}>NEW</button>
      </div>

      <div className="balance-row">
        <div className="balance-card">
          <p className="balance-label">Paid time Off</p>
          <p className="balance-value">24 Days Available</p>
        </div>
        <div className="balance-card">
          <p className="balance-label">Sick time off</p>
          <p className="balance-value">07 Days Available</p>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h3>Time off Type Request</h3>

            <label className="field-label">Time off Type</label>
            <select
              className="field-input"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option>Paid time off</option>
              <option>Sick Leave</option>
              <option>Unpaid Leaves</option>
            </select>

            <label className="field-label">Validity Period</label>
            <div className="field-row">
              <input type="date" className="field-input" required
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              <span>To</span>
              <input type="date" className="field-input" required
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </div>

            <label className="field-label">Allocation (days)</label>
            <input type="number" min="1" className="field-input"
              value={form.allocationDays}
              onChange={(e) => setForm((f) => ({ ...f, allocationDays: e.target.value }))} />

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
