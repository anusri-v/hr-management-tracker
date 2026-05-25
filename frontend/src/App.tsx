import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { googleLogout } from '@react-oauth/google'
import { Flex, Spin } from 'antd'
import GlobalLoadingBar from './utils/components/GlobalLoadingBar'
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
import ViewEmployee from './features/employees/ViewEmployee'
import EditEmployee from './features/employees/EditEmployee'
import apiClient, { ApiError } from './utils/apiClient'

export type User = {
  id: number
  email: string
  name?: string
  picture?: string
  status: number
}

export type AppUser = User

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
    apiClient.get<{ user: User }>('/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function handleSuccess(credential: string) {
    setError(null)
    try {
      await apiClient.post('/auth/google', { credential })
      const me = await apiClient.get<{ user: User }>('/me')
      setUser(me.user)
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 403) {
        const body = e.body as { detail?: string }
        setError(body?.detail || 'Your account is not authorized to access this app.')
        return
      }
      setError('Sign-in failed')
    }
  }

  async function handleLogout() {
    await apiClient.post('/auth/logout')
    googleLogout()
    setUser(null)
  }

  if (loading) return (
    <>
      <GlobalLoadingBar />
      <Flex justify="center" align="center" style={{ height: '100vh' }}>
        <Spin size="large" />
      </Flex>
    </>
  )

  const home = homeFor(user)

  return (
    <>
    <GlobalLoadingBar />
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
        <Route path="/employees/view/:employeeId" element={<ViewEmployee />} />
        <Route path="/employees/edit/:employeeId" element={<EditEmployee />} />
      </Route>
      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
    </>
  )
}

export default App
