import { useState } from 'react'
import '../App.css'
import { request } from '../lib/api'


/* ===================== AUTH COMPONENT ===================== */

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setEmail('')
    setPassword('')
    setConfirm('')
    setMessage(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    setMessage(null)

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill email and password.' })
      return
    }

    if (mode === 'signup' && password !== confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setLoading(true)
    try {


      /* ===================== SIGNUP ===================== */

      if (mode === 'signup') {
        const data = await request('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })

        setMessage({ type: 'success', text: data?.message || `Signed up ${email}` })
        reset()
        setMode('login')
        return
      }


      /* ===================== LOGIN ===================== */

      const data = await request('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      if (data?.token) {
        localStorage.setItem('token', data.token)
        setMessage({ type: 'success', text: 'Logged in' })
        onLogin && onLogin()
      } else {
        setMessage({ type: 'error', text: data?.message || 'Unexpected server response' })
      }
      reset()
    } catch (err) {
      // If server returns JSON error, err.body might be an object like {timestamp, status, error, path}
      let errorText = 'Server error'
      if (err?.body) {
        if (typeof err.body === 'string') {
          errorText = err.body
        } else if (err.body.message) {
          errorText = err.body.message
        } else if (err.body.error) {
          // Spring Boot often returns { error: "Bad Request", status: 400 ... }
          errorText = `${err.body.status || 'Error'} - ${err.body.error}`
        } else {
          errorText = JSON.stringify(err.body)
        }
      }
      setMessage({ type: 'error', text: errorText })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <img src="/Logo.png" alt="SmartGuardian Logo" className="auth-logo" />
        <h1>SmartGuardian</h1>
        <p>Integrated AI Health Monitoring</p>
      </div>
      <div className="auth-card">
        <h2>{mode === 'login' ? 'Log In' : 'Sign Up'}</h2>
        <form onSubmit={submit} className="auth-form">
          <label>
            Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>

          {mode === 'signup' && (
            <label>
              Confirm Password
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </label>
          )}

          <div className="auth-actions">
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Please wait...' : (mode === 'login' ? 'Log In' : 'Create Account')}</button>
            <button type="button" className="btn-link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null) }}>
              {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
            </button>
          </div>

          {message && (
            <div className={`auth-message ${message.type}`}>{message.text}</div>
          )}
        </form>
      </div>
    </div>
  )
}
