import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

// --- API CONTRACT (confirm this with your backend teammate ASAP) ---
// POST /auth/login   body: { email, password }
//   -> { token: string, user: { id, name, email, role, loginId, avatarUrl } }
// POST /auth/signup  body: { companyName, name, email, phone, password }
//   -> { token: string, user: {...same shape...} }
// If your backend uses different field names, only this file needs to change.

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dayflow_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      localStorage.setItem('dayflow_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('dayflow_user')
    }
  }, [user])

  async function login(email, password) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('dayflow_token', data.token)
      setUser(data.user)
      return { ok: true }
    } catch (err) {
      const message =
        err.code === 'ERR_NETWORK'
          ? 'Cannot reach the server. Check the backend is running and VITE_API_URL is correct.'
          : err.response?.data?.message || 'Invalid email or password.'
      setError(message)
      return { ok: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  async function signup(payload) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/signup', payload)
      localStorage.setItem('dayflow_token', data.token)
      setUser(data.user)
      return { ok: true }
    } catch (err) {
      const message =
        err.code === 'ERR_NETWORK'
          ? 'Cannot reach the server. Check the backend is running and VITE_API_URL is correct.'
          : err.response?.data?.message || 'Could not create account.'
      setError(message)
      return { ok: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('dayflow_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
