import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import Employees from './pages/Employees'
import EmployeeDetail from './pages/EmployeeDetail'
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
              {/* Role-aware landing page: Employee dashboard cards vs Admin
                  employee list (spec 3.2.1 / 3.2.2). */}
              <Route path="/" element={<Home />} />

              <Route path="/attendance" element={<Attendance />} />
              <Route path="/timeoff" element={<TimeOff />} />
              <Route path="/profile" element={<Profile />} />

              {/* Admin/HR only: employee directory + per-employee edit (3.2.2, 3.3.2). */}
              <Route element={<AdminRoute />}>
                <Route path="/employees" element={<Employees />} />
                <Route path="/employees/:id" element={<EmployeeDetail />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<SignIn />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
