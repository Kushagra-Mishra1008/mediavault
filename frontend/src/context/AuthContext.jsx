import { createContext, useContext, useState } from 'react';
import { apiPost, getToken, setToken, clearToken } from '../api/client';

const AuthContext = createContext(null);

// JWTs use base64URL encoding, not plain base64 - '-' instead of '+',
// '_' instead of '/', and padding characters stripped. atob() only
// understands plain base64, so this converts back before decoding.
// jjwt (your backend's JWT library) produces base64URL per spec, so
// skipping this step would throw on real tokens.
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

// Reads an existing, unexpired token synchronously on first render, so
// an already-authenticated user never sees a "logged out" frame or a
// loading screen. exp is in seconds (JWT spec); Date.now() is ms.
function readStoredUser() {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  if (decoded && decoded.exp * 1000 > Date.now()) {
    return { username: decoded.sub };
  }
  clearToken();
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  async function login(username, password) {
    const response = await apiPost('/auth/login', { username, password });
    setToken(response.token);
    setUser({ username: response.username });
  }

  async function register(username, email, password) {
    const response = await apiPost('/auth/register', { username, email, password });
    // Your AuthService issues a token immediately on register (see
    // AuthController) - so registering logs you straight in, no
    // separate login step needed after signup.
    setToken(response.token);
    setUser({ username: response.username });
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook so components do `const { user, login } = useAuth()`
// instead of importing useContext + AuthContext everywhere.
// eslint-disable-next-line react-refresh/only-export-components -- hook lives beside its provider
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}