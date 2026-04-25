import { useEffect, useState } from 'react'
import { googleLogout } from '@react-oauth/google'
import './App.css'
import AccessPendingPage from './features/auth/AccessPendingPage';
import LoginPage from './features/auth/LoginPage';

const API_URL = 'http://localhost:3000'

type User = {
  authorized_at?: string
  authorized_by?: number
  created_at: string
  email: string
  email_verified: boolean
  google_sub: string
  id: number
  last_login_at: string
  name?: string
  picture?: string
  revoked_at?: null
  revoked_by?: number
  status: number
  updated_at: string
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

  if (user?.status === 0) {
    return <AccessPendingPage email="hr-blr@shopup.org" onSignOut={handleLogout} />
  }

  return (
    <LoginPage
      onCredential={handleSuccess}
      onError={() => setError('Google sign-in failed')}
      error={error}
    />
  )
}

export default App
