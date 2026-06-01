import { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/UI/Toast';
import ErrorBoundary from './components/UI/ErrorBoundary';
import Navbar from './components/Navbar/Navbar';
import Dock from './components/Dock/Dock';
import Login from './pages/Login';
import SkeletonPage from './components/UI/SkeletonPage';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import OnboardingTour from './components/OnboardingTour';
import './styles/global.css';
import './App.css';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Patients = lazy(() => import('./pages/Patients'));
const Doctors = lazy(() => import('./pages/Doctors'));
const DoctorProfile = lazy(() => import('./pages/DoctorProfile'));
const Appointments = lazy(() => import('./pages/Appointments'));
const NewAppointment = lazy(() => import('./pages/NewAppointment'));
const Availability = lazy(() => import('./pages/Availability'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

function ProtectedShell({ children }) {
  const navigate = useNavigate();
  const lastGPress = useRef(0);

  useEffect(() => {
    const isTyping = (target) => {
      if (!target) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
    };

    const handler = (e) => {
      if (isTyping(e.target) && e.key !== 'Escape') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const now = Date.now();

      if (e.key === 'g' || e.key === 'G') {
        lastGPress.current = now;
        return;
      }
      if (now - lastGPress.current < 800) {
        const key = e.key.toLowerCase();
        if (key === 'd') { navigate('/'); lastGPress.current = 0; e.preventDefault(); return; }
        if (key === 'a') { navigate('/appointments'); lastGPress.current = 0; e.preventDefault(); return; }
        if (key === 'p') { navigate('/patients'); lastGPress.current = 0; e.preventDefault(); return; }
        if (key === 'r') { navigate('/reports'); lastGPress.current = 0; e.preventDefault(); return; }
      }

      if (e.key === 'n' || e.key === 'N') {
        navigate('/appointments/new');
        e.preventDefault();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  return (
    <div className="app-shell">
      <Navbar />
      {children}
      <Dock />
      <KeyboardShortcutsHelp />
      <OnboardingTour />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function withErrorBoundary(PageComponent) {
  return (
    <ErrorBoundary>
      <PageComponent />
    </ErrorBoundary>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProtectedShell>{withErrorBoundary(Dashboard)}</ProtectedShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <ProtectedShell>{withErrorBoundary(Patients)}</ProtectedShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctors"
          element={
            <ProtectedRoute>
              <ProtectedShell>{withErrorBoundary(Doctors)}</ProtectedShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctors/:id"
          element={
            <ProtectedRoute>
              <ProtectedShell>{withErrorBoundary(DoctorProfile)}</ProtectedShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <ProtectedShell>{withErrorBoundary(Appointments)}</ProtectedShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/new"
          element={
            <ProtectedRoute>
              <ProtectedShell>{withErrorBoundary(NewAppointment)}</ProtectedShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/availability"
          element={
            <ProtectedRoute>
              <ProtectedShell>{withErrorBoundary(Availability)}</ProtectedShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ProtectedShell>{withErrorBoundary(Reports)}</ProtectedShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ProtectedShell>{withErrorBoundary(Settings)}</ProtectedShell>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
