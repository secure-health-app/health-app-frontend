import { useState } from 'react'
import '../App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export default function Auth() {
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
    if (mode === 'signup') {
      if (password !== confirm) {
        setMessage({ type: 'error', text: 'Passwords do not match.' })
        return
      }
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })
        const data = await response.json()
        if (!response.ok) {
          setMessage({ type: 'error', text: data.message || 'Signup failed. Please try again.' })
          return
        }
        setMessage({ type: 'success', text: data.message || `Signed up ${email}` })
        reset()
      } catch {
        setMessage({ type: 'error', text: 'Network error. Please try again.' })
      } finally {
        setLoading(false)
      }
      return
    }

    // TODO: call login API
    setMessage({ type: 'success', text: `Logged in ${email}` })
    reset()
  }

  return (
    <div className="auth-container">
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
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : (mode === 'login' ? 'Log In' : 'Create Account')}
            </button>
            <button type="button" className="btn-link" disabled={loading} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null) }}>
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
