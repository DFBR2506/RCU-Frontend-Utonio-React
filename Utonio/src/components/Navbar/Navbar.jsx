import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, User, Lock, Sliders, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth.js';
import { useTheme } from '../../hooks/useTheme.js';
import utonioLogo from '../../assets/utonio4.png';
import './Navbar.css';

function getInitials(name) {
  if (!name) return '?';
  return name
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar" role="banner">
      <button
        className="navbar-brand"
        onClick={() => navigate('/')}
        aria-label="Go to dashboard"
      >
        <span className="navbar-brand-icon">
          <img src={utonioLogo} alt="Utonio" width="18" height="18" />
        </span>
        <span className="navbar-brand-text">Utonio</span>
      </button>

      <div className="navbar-actions">
        <button
          className="navbar-icon-btn theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          <span className="theme-toggle-icon" key={isDark ? 'light' : 'dark'}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </span>
        </button>

        <div className="navbar-profile" ref={menuRef}>
          <button
            className="navbar-profile-btn"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="navbar-avatar">{getInitials(user?.name)}</span>
            <span className="navbar-profile-name">{user?.name || 'Account'}</span>
            <ChevronDown size={14} className={menuOpen ? 'chev flipped' : 'chev'} />
          </button>

          {menuOpen && (
            <div className="navbar-dropdown" role="menu">
              <button
                className="navbar-dropdown-item"
                role="menuitem"
                onClick={() => { setMenuOpen(false); navigate('/settings'); }}
              >
                <User size={16} />
                <span>My Profile</span>
              </button>
              <button
                className="navbar-dropdown-item"
                role="menuitem"
                onClick={() => { setMenuOpen(false); navigate('/settings'); }}
              >
                <Lock size={16} />
                <span>Change Password</span>
              </button>
              <button
                className="navbar-dropdown-item"
                role="menuitem"
                onClick={() => { setMenuOpen(false); navigate('/settings'); }}
              >
                <Sliders size={16} />
                <span>Preferences</span>
              </button>
              <div className="navbar-dropdown-divider" />
              <button
                className="navbar-dropdown-item danger"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        <button
          className="navbar-logout-btn"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
