// Base path is just "/api" - the vite.config.js proxy we set up earlier
// silently forwards anything starting with /api to localhost:8080 during
// dev. In production this'll need to point at wherever the backend is
// actually deployed - we'll handle that with an env variable in Phase 5.
const API_BASE = '/api';

const TOKEN_KEY = 'mediavault_token';

// Centralizing these three functions means nothing else in the app talks
// to localStorage directly - if we ever swap storage strategy (see the
// localStorage vs in-memory discussion from earlier), this is the only
// file that changes.
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Custom error class so calling code can do "catch (err) { err.message }"
// and get exactly what your GlobalExceptionHandler sent back - not a
// generic "Failed to fetch" or an HTML error page dumped into a string.
// The extra `status` field lets callers branch on it later if they want
// (e.g. redirect to /login specifically on a 401) without re-parsing
// anything.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// The single function everything else in the app funnels through.
// method/path/body cover every verb your backend uses (GET/POST/PATCH/
// DELETE) - no need for four separate functions duplicating this logic.
async function request(method, path, body) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
  };

  // Only attach the header if we actually have a token - /api/auth/login
  // and /api/auth/register are called BEFORE a token exists, and sending
  // "Authorization: Bearer null" would be worse than sending nothing.
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    // DELETE and GET requests have no body - JSON.stringify(undefined)
    // returns undefined, which fetch correctly omits, so this is safe
    // to always include rather than branching on method.
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content (your DELETE /api/library/{id} response) has no body
  // to parse - calling response.json() on it throws. Handle it before
  // trying to parse anything.
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  // response.ok is false for any 4xx/5xx status - this is where your
  // backend's {timestamp, status, message} shape gets unpacked into an
  // ApiError. Every controller error (409 conflict, 404 not found, 401
  // bad credentials) flows through this one branch.
  if (!response.ok) {
    throw new ApiError(data.message || 'Something went wrong', data.status || response.status);
  }

  return data;
}

// Thin convenience wrappers - these are what components actually call.
// Reads as close to plain English as fetch gets: apiGet('/library'),
// apiPost('/library', newEntry).
export const apiGet = (path) => request('GET', path);
export const apiPost = (path, body) => request('POST', path, body);
export const apiPatch = (path, body) => request('PATCH', path, body);
export const apiDelete = (path) => request('DELETE', path);