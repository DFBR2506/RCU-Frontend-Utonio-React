import { useState, useCallback } from 'react';
import { AuthContext } from './authContextObject.js';

const TEST_USERS = [
  { id: 1, email: 'admin@utonio.edu', password: 'admin123', name: 'Admin User', role: 'ADMIN' },
  { id: 2, email: 'reception@utonio.edu', password: 'recep123', name: 'Reception Staff', role: 'RECEPTIONIST' },
  { id: 3, email: 'doctor@utonio.edu', password: 'doctor123', name: 'Dr. Sarah Chen', role: 'DOCTOR' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const found = TEST_USERS.find(u => u.email === email && u.password === password);
      if (!found) {
        throw new Error('Invalid credentials');
      }
      const fakeToken = 'jwt_' + found.id + '_' + Date.now();
      setToken(fakeToken);
      setUser({ id: found.id, email: found.email, name: found.name, role: found.role });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = { user, token, login, logout, loading, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}