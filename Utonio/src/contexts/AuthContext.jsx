import { useState, useCallback } from 'react';
import { AuthContext } from './authContextObject.js';
import { loginRequest } from '../api/AuthApi.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (documentNumber, password) => {
    setLoading(true);
    try {
      const data = await loginRequest({ documentNumber, password });
      const receivedToken = data.accessToken;
      localStorage.setItem('umars_token', receivedToken);
      setToken(receivedToken);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('umars_token');
    setToken(null);
    setUser(null);
  }, []);

  const value = { user, token, login, logout, loading, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}