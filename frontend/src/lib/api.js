const API_BASE = import.meta.env.VITE_API_URL || ''

async function request(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  const init = { ...opts, headers }
  const res = await fetch(`${API_BASE}${path}`, init)
  const text = await res.text()
  let body = null
  try { body = text ? JSON.parse(text) : null } catch (e) { body = text }
  if (!res.ok) throw { status: res.status, body }
  return body
}

function authRequest(path, opts = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers = { ...(opts.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return request(path, { ...opts, headers })
}

export { request, authRequest }
