/* ===================== API CONFIG ===================== */

const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("VITE_API_URL is not set");
}

/**
 * Perform a fetch request to the API and return parsed JSON (if any).
 * Throws an object with `status` and `body` when the response is not ok.
 */
async function request(path, opts = {}) {

  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {})
  };

  const init = {
    ...opts,
    headers
  };

  // build full API URL
  const res = await fetch(`${API_BASE}${path}`, init);

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
    return;
  }

  // read as text first (handles non-JSON safely)
  const text = await res.text();

  let body = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // fallback to raw text
    body = text;
  }


  if (!res.ok) throw { status: res.status, body };

  return body;
}

/**
 * Same as request but adds Bearer token automatically
 */
function authRequest(path, opts = {}) {

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  const headers = {
    ...(opts.headers || {})
  };

  // only attach valid token
  if (
    token &&
    token.trim() !== "" &&
    token !== "null" &&
    token !== "undefined"
  ) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return request(path, { ...opts, headers });
}


export { request, authRequest };