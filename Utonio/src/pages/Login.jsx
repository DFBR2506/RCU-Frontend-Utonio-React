import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { useToast } from '../hooks/useToast';
import ShaderBackground from '../components/ShaderBackground';
import './Login.css';

const TEST_USERS = [
  { email: 'admin@utonio.edu', password: 'admin123', name: 'Dr. Admin', role: 'admin' },
  { email: 'reception@utonio.edu', password: 'recep123', name: 'Reception Staff', role: 'receptionist' },
  { email: 'doctor@utonio.edu', password: 'doctor123', name: 'Dr. Sarah Chen', role: 'doctor' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid credentials. Please try again.');
      return;
    }

    const matched = TEST_USERS.find(u => u.email === email);
    toast.success(`Welcome back, ${matched?.name || email}`, { title: 'Signed in' });
  }

  return (
    <div className="login-page">
      <ShaderBackground />

      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
              <rect width="44" height="44" rx="12" fill="var(--accent-lime)" fillOpacity="0.12" />
              <path d="M22 11v22M11 22h22" stroke="var(--accent-lime)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="login-title">Welcome to Utonio</h1>
          <p className="login-subtitle">Sign in to continue to the health center</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="login-error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@utonio.edu"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="login-password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="login-spinner" />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="login-hint">
          <div className="login-hint-label">Test credentials</div>
          <div className="login-hint-grid">
            {TEST_USERS.map(u => (
              <button
                key={u.email}
                type="button"
                className="login-hint-card"
                onClick={() => { setEmail(u.email); setPassword(u.password); }}
              >
                <span className="login-hint-role">{u.role}</span>
                <span className="login-hint-email">{u.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
