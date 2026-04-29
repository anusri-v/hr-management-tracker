import { useEffect, useState } from 'react'
import { googleLogout } from '@react-oauth/google'
import LoginPage from './features/auth/LoginPage'

const API_URL = 'http://localhost:3000'

type User = {
  id: number
  email: string
  name?: string
  picture?: string
  status: number
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

  if (user) {
    return (
      <div>
        <p>Signed in as {user.email}</p>
        <button onClick={handleLogout}>Sign out</button>
      </div>
    )
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
