import { useState } from 'react'
import '../App.css'
import { request } from '../lib/api'

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
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        const data = await request('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        if (data?.token) {
          localStorage.setItem('token', data.token)
        }
        setMessage({ type: 'success', text: data?.message || `Signed up ${email}` })
        reset()
        setMode('login')
        return
      }

      // login
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (data?.token) {
        localStorage.setItem('token', data.token)
        setMessage({ type: 'success', text: 'Logged in' })
        // TODO: replace with AuthContext / navigation
      } else {
        setMessage({ type: 'error', text: data?.message || 'Unexpected server response' })
      }
      reset()
    } catch (err) {
      const errMsg = err?.body?.message || err?.body || 'Server error'
      setMessage({ type: 'error', text: errMsg })
    } finally {
      setLoading(false)
    }
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
