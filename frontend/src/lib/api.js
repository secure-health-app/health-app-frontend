// API helper wrapper used by the frontend.
//
// - `API_BASE` is read from `import.meta.env.VITE_API_URL`. During development
//   you can set this in `frontend/.env.local` (not committed).
// - `request(path, opts)` performs a JSON request and returns the parsed body
//   or throws an object `{ status, body }` on non-2xx responses.
// - `authRequest(path, opts)` adds a `Authorization: Bearer <token>` header
//   when a `token` is found in `localStorage` and delegates to `request`.

const API_BASE = import.meta.env.VITE_API_URL || ''

/**
 * Perform a fetch request to the API and return parsed JSON (if any).
 * Throws an object with `status` and `body` when the response is not ok.
 *
 * @param {string} path - The path to append to the API base (e.g. '/auth/login')
 * @param {RequestInit} [opts] - Optional fetch init options (method, body, headers, etc.)
 * @returns {Promise<any>} - Parsed response body (JSON or raw text)
 */
async function request(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  const init = { ...opts, headers }

  // Build full URL using the configured API base.
  const res = await fetch(`${API_BASE}${path}`, init)

    if (res.status === 401) {
    localStorage.removeItem("token")
    window.location.href = "/login"
    return
  }

  // Read response as text first so we can gracefully handle non-JSON responses.
  const text = await res.text()
  let body = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    // Not JSON — return raw text
    body = text
  }

  if (!res.ok) throw { status: res.status, body }
  return body
}

/**
 * Same as `request` but automatically attaches a Bearer token from localStorage
 * when available. Use this for endpoints that require authentication.
 *
 * @param {string} path
 * @param {RequestInit} [opts]
 */
function authRequest(path, opts = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers = { ...(opts.headers || {}) }

  if (token && token !== "null" && token !== "undefined") {
    headers['Authorization'] = `Bearer ${token}`
  }

  return request(path, { ...opts, headers })
}

export { request, authRequest }
