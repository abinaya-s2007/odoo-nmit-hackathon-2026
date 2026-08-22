import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

// GET /profile -> { id, name, loginId, email, phone, address, dob, avatarUrl,
//   about, skills, jobTitle, department, joinDate,
//   salary: { basic, hra, allowances, pf }, documents: [{name,url}] }
// PATCH /profile  body: { phone, address, about, skills } (employee-editable fields, 3.3.2)
//   -> Admin/HR calls PATCH /employees/:id instead (see EmployeeDetail.jsx) to edit everything.
// POST /profile/avatar  multipart -> { avatarUrl }
// POST /profile/password  body: { currentPassword, newPassword }

const TABS = ['Resume', 'Private Info', 'Salary Info', 'Security']

// Fields a regular employee is allowed to edit themselves (3.3.2: "Employees
// can edit limited fields — address, phone, profile picture"). Admins editing
// their own profile get the same self-service scope here; full record edits
// for *other* employees happen on the EmployeeDetail page instead.
const EMPLOYEE_EDITABLE = ['phone', 'address', 'about', 'skills']

export default function Profile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Resume')
  const isAdmin = user?.role === 'admin' || user?.role === 'hr'

  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.get('/profile')
      .then((res) => {
        setProfile(res.data)
        setForm(res.data)
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load your profile.'))
      .finally(() => setLoading(false))
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    try {
      // Only send the fields this user is allowed to change.
      const payload = {}
      EMPLOYEE_EDITABLE.forEach((k) => { payload[k] = form[k] })
      const { data } = await api.patch('/profile', payload)
      setProfile(data)
      setForm(data)
      setEditing(false)
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (profile) setForm(profile)
    setSaveError(null)
    setEditing(false)
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const { data } = await api.post('/profile/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfile((p) => ({ ...p, avatarUrl: data.avatarUrl }))
      setForm((f) => ({ ...f, avatarUrl: data.avatarUrl }))
    } catch (err) {
      alert(err.response?.data?.message || 'Could not upload photo.')
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.')
      return
    }
    setPwSaving(true)
    setPwError(null)
    setPwSuccess(false)
    try {
      await api.post('/profile/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPwSuccess(true)
    } catch (err) {
      setPwError(err.response?.data?.message || 'Could not update password.')
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) return <div className="page"><p className="muted">Loading your profile...</p></div>
  if (error) return <div className="page"><p className="form-error">{error}</p></div>
  if (!profile) return null

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="avatar-img" /> : (user?.name?.[0] ?? '?')}
        </div>
        <div>
          <h2 style={{ margin: 0 }}>{profile.name}</h2>
          <p className="muted" style={{ margin: '2px 0 0' }}>{profile.loginId}</p>
        </div>
        <label className="btn-secondary btn-small" style={{ marginLeft: 'auto', cursor: 'pointer' }}>
          {avatarUploading ? 'Uploading...' : 'Change photo'}
          <input type="file" accept="image/*" hidden onChange={handleAvatarChange} disabled={avatarUploading} />
        </label>
      </div>

      <div className="tab-row">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Resume' && (
        <form onSubmit={handleSave} className="tab-panel edit-form">
          <div className="form-grid">
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">About</label>
              <textarea className="field-input" rows={3} disabled={!editing}
                value={form.about || ''} onChange={(e) => update('about', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">Skills</label>
              <input className="field-input" placeholder="Comma separated" disabled={!editing}
                value={form.skills || ''} onChange={(e) => update('skills', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Job Title</label>
              <input className="field-input" value={profile.jobTitle || '—'} disabled />
            </div>
            <div>
              <label className="field-label">Department</label>
              <input className="field-input" value={profile.department || '—'} disabled />
            </div>
          </div>
          {profile.documents?.length > 0 && (
            <>
              <h4 className="section-heading">Documents</h4>
              <ul className="activity-list">
                {profile.documents.map((doc) => (
                  <li key={doc.url} className="activity-item">
                    <a href={doc.url} target="_blank" rel="noreferrer">{doc.name}</a>
                  </li>
                ))}
              </ul>
            </>
          )}
          <EditActions editing={editing} saving={saving} saveError={saveError}
            onEdit={() => setEditing(true)} onCancel={handleCancel} />
        </form>
      )}

      {activeTab === 'Private Info' && (
        <form onSubmit={handleSave} className="tab-panel edit-form">
          <div className="form-grid">
            <div>
              <label className="field-label">Date of Birth</label>
              <input className="field-input" value={profile.dob || '—'} disabled />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input className="field-input" value={profile.email || '—'} disabled />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input className="field-input" disabled={!editing}
                value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">Address</label>
              <input className="field-input" disabled={!editing}
                value={form.address || ''} onChange={(e) => update('address', e.target.value)} />
            </div>
          </div>
          <p className="muted" style={{ fontSize: 12 }}>
            Only phone, address, and your profile photo can be changed here. Contact HR to update anything else.
          </p>
          <EditActions editing={editing} saving={saving} saveError={saveError}
            onEdit={() => setEditing(true)} onCancel={handleCancel} />
        </form>
      )}

      {activeTab === 'Salary Info' && (
        <div className="tab-panel">
          {profile.salary ? (
            <div className="form-grid">
              <div><label className="field-label">Basic</label><input className="field-input" value={profile.salary.basic ?? '—'} disabled /></div>
              <div><label className="field-label">HRA</label><input className="field-input" value={profile.salary.hra ?? '—'} disabled /></div>
              <div><label className="field-label">Allowances</label><input className="field-input" value={profile.salary.allowances ?? '—'} disabled /></div>
              <div><label className="field-label">PF</label><input className="field-input" value={profile.salary.pf ?? '—'} disabled /></div>
            </div>
          ) : (
            <p className="muted">Salary details aren't available yet.</p>
          )}
          <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            Payroll is read-only here (spec 3.6.1). {isAdmin ? 'To update salary structures for the team, open an employee from the Employees list.' : 'Contact HR if you have questions.'}
          </p>
        </div>
      )}

      {activeTab === 'Security' && (
        <form onSubmit={handlePasswordSubmit} className="tab-panel edit-form">
          <div className="form-grid">
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">Current Password</label>
              <input type="password" className="field-input" required
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">New Password</label>
              <input type="password" className="field-input" required
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Confirm New Password</label>
              <input type="password" className="field-input" required
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
            </div>
          </div>
          {pwError && <p className="form-error">{pwError}</p>}
          {pwSuccess && <p className="muted" style={{ color: 'var(--present)' }}>Password updated.</p>}
          <div className="modal-actions">
            <button type="submit" className="btn-primary btn-small" disabled={pwSaving}>
              {pwSaving ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function EditActions({ editing, saving, saveError, onEdit, onCancel }) {
  return (
    <>
      {saveError && <p className="form-error">{saveError}</p>}
      <div className="modal-actions">
        {!editing && (
          <button type="button" className="btn-primary btn-small" onClick={onEdit}>Edit</button>
        )}
        {editing && (
          <>
            <button type="submit" className="btn-primary btn-small" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" className="btn-secondary btn-small" onClick={onCancel}>Cancel</button>
          </>
        )}
      </div>
    </>
  )
}
