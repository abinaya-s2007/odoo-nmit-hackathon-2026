import axios from 'axios'

// Base URL comes from .env (VITE_API_URL) so swapping backends never
// means touching code — see .env.example.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach the auth token to every request once the user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dayflow_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If the backend ever returns 401, force the user back to sign in.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dayflow_token')
      localStorage.removeItem('dayflow_user')
      window.location.href = '/signin'
    }
    return Promise.reject(error)
  }
)

export default api
