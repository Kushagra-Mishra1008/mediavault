import { createContext, useContext, useState, useEffect } from 'react';
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // loading covers the brief window on first page load where we're
  // checking localStorage for an existing token - without this, a
  // protected route would flash "not logged in" for a frame even for
  // an already-authenticated user, before the check finishes.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeToken(token);
      // exp is in seconds since epoch (JWT spec); Date.now() is
      // milliseconds - hence the *1000. If the token's expired, don't
      // trust it even though it's sitting in storage.
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser({ username: decoded.sub });
      } else {
        clearToken();
      }
    }
    setLoading(false);
  }, []);

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
    loading,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook so components do `const { user, login } = useAuth()`
// instead of importing useContext + AuthContext everywhere.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}