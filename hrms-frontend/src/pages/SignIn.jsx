import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'  
export default function SignIn() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const result = await login(email, password)
    if (result.ok) navigate('/')
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">
  <img src={logo} alt="Company logo" className="logo-img" />
</div>

        <label className="field-label" htmlFor="email">Login Id / Email :-</label>
        <input
          id="email"
          className="field-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder=""
          required
        />

        <label className="field-label" htmlFor="password">Password :-</label>
        <input
          id="password"
          type="password"
          className="field-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="form-error">{error}</p>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'SIGN IN'}
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  )
}
