import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import { ConfigProvider } from 'antd'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
if (!clientId) {
  throw new Error('VITE_GOOGLE_CLIENT_ID is not set in frontend/.env')
}

createRoot(document.getElementById('root')!).render(
  <ConfigProvider theme={{ token: { colorPrimary: '#3CB5B0' } }}>
    <StrictMode>
      <GoogleOAuthProvider clientId={clientId}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </StrictMode>
  </ConfigProvider>,
)
