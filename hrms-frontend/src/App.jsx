import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import TimeOff from './pages/TimeOff'
import Profile from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Employees />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/timeoff" element={<TimeOff />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="*" element={<SignIn />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
