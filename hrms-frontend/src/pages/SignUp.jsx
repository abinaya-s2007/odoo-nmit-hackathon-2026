import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Per the wireframe note: normal employees don't self-register — this
// Sign Up creates the company/admin account. Admins create employee
// logins afterward, auto-generated in the OI[Initials][Year][Serial] format.
export default function SignUp() {
  const { signup, loading, error } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [logoFile, setLogoFile] = useState(null)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match.')
      return
    }
    // If your backend expects multipart/form-data for the logo upload,
    // swap this for a FormData payload — ask your backend teammate.
    const result = await signup({ ...form, logoFile })
    if (result.ok) navigate('/')
  }

  return (
    <div className="auth-screen">
      <form className="auth-card auth-card-wide" onSubmit={handleSubmit}>
        <div className="auth-logo">App/Web Logo</div>

        <div className="field-row">
          <label className="field-label" htmlFor="companyName">Company Name :-</label>
          <input
            id="companyName"
            className="field-input"
            value={form.companyName}
            onChange={(e) => update('companyName', e.target.value)}
            required
          />
          <label className="upload-btn">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
            ⬆
          </label>
        </div>

        <label className="field-label" htmlFor="name">Name :-</label>
        <input id="name" className="field-input" value={form.name}
          onChange={(e) => update('name', e.target.value)} required />

        <label className="field-label" htmlFor="signupEmail">Email :-</label>
        <input id="signupEmail" type="email" className="field-input" value={form.email}
          onChange={(e) => update('email', e.target.value)} required />

        <label className="field-label" htmlFor="phone">Phone :-</label>
        <input id="phone" className="field-input" value={form.phone}
          onChange={(e) => update('phone', e.target.value)} required />

        <label className="field-label" htmlFor="signupPassword">Password :-</label>
        <input id="signupPassword" type="password" className="field-input" value={form.password}
          onChange={(e) => update('password', e.target.value)} required />

        <label className="field-label" htmlFor="confirmPassword">Confirm Password :-</label>
        <input id="confirmPassword" type="password" className="field-input" value={form.confirmPassword}
          onChange={(e) => update('confirmPassword', e.target.value)} required />

        {error && <p className="form-error">{error}</p>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </form>
    </div>
  )
}
