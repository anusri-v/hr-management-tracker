import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { googleLogout } from '@react-oauth/google'
import LoginPage from './features/auth/LoginPage'
import AccessPendingPage from './features/auth/AccessPendingPage'
import AccessRevokedPage from './features/auth/AccessRevokedPage'
import Main from './features/app/Main'
import DashboardPage from './features/dashboard/DashboardPage'
import EmployeesPage from './features/employees/EmployeesPage'
import RemindersPage from './features/reminders/RemindersPage'
import UserAccessPage from './features/userAccess/UserAccessPage'
import ActivityLogPage from './features/activityLog/ActivityLogPage'
import AddEmployee from './features/employees/AddEmployee'

const API_URL = 'http://localhost:3000'

export type User = {
  id: number
  email: string
  name?: string
  picture?: string
  status: number
}

function homeFor(user: User | null) {
  if (!user) return '/login'
  if (user.status === 0) return '/access-pending'
  if (user.status === 2) return '/access-revoked'
  return '/dashboard'
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function handleSuccess(credential: string) {
    setError(null)
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })

    if (res.status === 403) {
      const data = await res.json().catch(() => ({}))
      setError(data.detail || 'Your account is not authorized to access this app.')
      return
    }

    if (!res.ok) {
      setError('Sign-in failed')
      return
    }

    const me = await fetch(`${API_URL}/me`, { credentials: 'include' }).then((r) => r.json())
    setUser(me.user)
  }

  async function handleLogout() {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
    googleLogout()
    setUser(null)
  }

  if (loading) return <p>Loading…</p>

  const home = homeFor(user)

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={home} replace />
            : <LoginPage
                onCredential={handleSuccess}
                onError={() => setError('Google sign-in failed')}
                error={error}
              />
        }
      />
      <Route
        path="/access-pending"
        element={
          user?.status === 0
            ? <AccessPendingPage handleLogout={handleLogout} />
            : <Navigate to={home} replace />
        }
      />
      <Route
        path="/access-revoked"
        element={
          user?.status === 2
            ? <AccessRevokedPage handleLogout={handleLogout} />
            : <Navigate to={home} replace />
        }
      />
      <Route
        element={
          user?.status === 1
            ? <Main user={user} handleLogout={handleLogout} />
            : <Navigate to={home} replace />
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/user-access" element={<UserAccessPage />} />
        <Route path="/activity-log" element={<ActivityLogPage />} />
        <Route path="/employees/add" element={<AddEmployee />} />
      </Route>
      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
  )
}

export default App
