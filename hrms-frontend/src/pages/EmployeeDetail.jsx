import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'

// GET /employees/:id -> full employee record:
//   { id, name, email, phone, address, dob, avatarUrl,
//     jobTitle, department, joinDate, status,
//     salary: { basic, hra, allowances, pf } }
// PATCH /employees/:id  body: same shape (Admin can edit everything, 3.3.2)

const EMPTY = {
  name: '', email: '', phone: '', address: '', dob: '',
  jobTitle: '', department: '', joinDate: '',
  salary: { basic: '', hra: '', allowances: '', pf: '' }
}

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.get(`/employees/${id}`)
      .then((res) => {
        setEmployee(res.data)
        setForm({ ...EMPTY, ...res.data, salary: { ...EMPTY.salary, ...res.data.salary } })
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load this employee.'))
      .finally(() => setLoading(false))
  }, [id])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }
  function updateSalary(field, value) {
    setForm((f) => ({ ...f, salary: { ...f.salary, [field]: value } }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    try {
      const { data } = await api.patch(`/employees/${id}`, form)
      setEmployee(data)
      setForm({ ...EMPTY, ...data, salary: { ...EMPTY.salary, ...data.salary } })
      setEditing(false)
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (employee) setForm({ ...EMPTY, ...employee, salary: { ...EMPTY.salary, ...employee.salary } })
    setSaveError(null)
    setEditing(false)
  }

  if (loading) return <div className="page"><p className="muted">Loading...</p></div>
  if (error) return <div className="page"><p className="form-error">{error}</p></div>
  if (!employee) return null

  return (
    <div className="page">
      <div className="page-toolbar">
        <Link to="/employees" className="btn-secondary btn-small">&larr; All employees</Link>
        <div style={{ flex: 1 }} />
        {!editing && (
          <button className="btn-primary btn-small" onClick={() => setEditing(true)}>Edit</button>
        )}
      </div>

      <div className="profile-header">
        <div className="profile-avatar">
          {employee.avatarUrl ? <img src={employee.avatarUrl} alt="" className="avatar-img" /> : employee.name?.[0] ?? '?'}
        </div>
        <div>
          <h2 style={{ margin: 0 }}>{employee.name}</h2>
          <p className="muted" style={{ margin: '2px 0 0' }}>{employee.jobTitle || 'No title set'} &middot; {employee.department || 'No department'}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="tab-panel edit-form">
        <h4 className="section-heading">Personal Details</h4>
        <div className="form-grid">
          <div>
            <label className="field-label">Full Name</label>
            <input className="field-input" value={form.name} disabled={!editing}
              onChange={(e) => update('name', e.target.value)} required />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input type="email" className="field-input" value={form.email} disabled={!editing}
              onChange={(e) => update('email', e.target.value)} required />
          </div>
          <div>
            <label className="field-label">Phone</label>
            <input className="field-input" value={form.phone} disabled={!editing}
              onChange={(e) => update('phone', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Date of Birth</label>
            <input type="date" className="field-input" value={form.dob} disabled={!editing}
              onChange={(e) => update('dob', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="field-label">Address</label>
            <input className="field-input" value={form.address} disabled={!editing}
              onChange={(e) => update('address', e.target.value)} />
          </div>
        </div>

        <h4 className="section-heading">Job Details</h4>
        <div className="form-grid">
          <div>
            <label className="field-label">Job Title</label>
            <input className="field-input" value={form.jobTitle} disabled={!editing}
              onChange={(e) => update('jobTitle', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Department</label>
            <input className="field-input" value={form.department} disabled={!editing}
              onChange={(e) => update('department', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Join Date</label>
            <input type="date" className="field-input" value={form.joinDate} disabled={!editing}
              onChange={(e) => update('joinDate', e.target.value)} />
          </div>
        </div>

        <h4 className="section-heading">Salary Structure</h4>
        <div className="form-grid">
          <div>
            <label className="field-label">Basic</label>
            <input type="number" className="field-input" value={form.salary.basic} disabled={!editing}
              onChange={(e) => updateSalary('basic', e.target.value)} />
          </div>
          <div>
            <label className="field-label">HRA</label>
            <input type="number" className="field-input" value={form.salary.hra} disabled={!editing}
              onChange={(e) => updateSalary('hra', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Allowances</label>
            <input type="number" className="field-input" value={form.salary.allowances} disabled={!editing}
              onChange={(e) => updateSalary('allowances', e.target.value)} />
          </div>
          <div>
            <label className="field-label">PF</label>
            <input type="number" className="field-input" value={form.salary.pf} disabled={!editing}
              onChange={(e) => updateSalary('pf', e.target.value)} />
          </div>
        </div>

        {saveError && <p className="form-error">{saveError}</p>}

        {editing && (
          <div className="modal-actions">
            <button type="submit" className="btn-primary btn-small" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" className="btn-secondary btn-small" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
