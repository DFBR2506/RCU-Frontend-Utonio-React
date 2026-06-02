import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { LayoutDashboard, Users, Stethoscope, CalendarCheck, Clock, BarChart2, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import './Dock.css';

const NAV_ITEMS = [
  { path: '/',              label: 'Dashboard',     Icon: LayoutDashboard, bg: '#1A1A2E', bgLight: '#ECEAFF', tint: '#7B6EF6' },
  { path: '/patients',      label: 'Patients',      Icon: Users,           bg: '#1A2E1A', bgLight: '#E3F8EE', tint: '#3DD68C' },
  { path: '/doctors',       label: 'Doctors',       Icon: Stethoscope,     bg: '#1A2428', bgLight: '#E0F7FA', tint: '#00BCD4' },
  { path: '/appointments',  label: 'Appointments',  Icon: CalendarCheck,   bg: '#2E1A1A', bgLight: '#FCE8E8', tint: '#F25C5C' },
  { path: '/availability',  label: 'Availability',  Icon: Clock,           bg: '#2E2A1A', bgLight: '#F4FAE0', tint: '#C8F55A' },
  { path: '/reports',       label: 'Reports',       Icon: BarChart2,       bg: '#1A1A2E', bgLight: '#ECEAFF', tint: '#7B6EF6' },
  { path: '/settings',      label: 'Settings',      Icon: SettingsIcon,    bg: '#1E1E1E', bgLight: '#EBEBF0', tint: '#EEEEF0' },
];

const DESKTOP = { base: 52, max: 76 };
const MOBILE  = { base: 40, max: 52 };

function DockIcon({ item, dockMouseX, dockRef, sizes, theme }) {
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const iconBg = theme === 'dark' ? item.bg : item.bgLight;
  const iconTint = theme === 'dark' ? item.tint : (item.tintLight || item.tint);

  const distance = useTransform(dockMouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect()
      ?? dockRef.current?.getBoundingClientRect()
      ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [sizes.base, sizes.max, sizes.base]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });
  const iconSize = Math.round(sizes.base * 0.54);

  return (
    <button
      ref={ref}
      className="dock-item"
      onClick={() => navigate(item.path)}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
      type="button"
    >
      <motion.div
        className="dock-icon-wrap"
        style={{
          width,
          height: width,
          background: iconBg,
          boxShadow: isActive ? `0 0 16px ${iconTint}55` : '0 0 0px transparent',
        }}
      >
        <item.Icon size={iconSize} color={iconTint} strokeWidth={2} />
      </motion.div>
      {isActive && <span className="dock-dot" />}
      <span className="dock-tooltip">{item.label}</span>
    </button>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

export default function Dock() {
  const dockRef = useRef(null);
  const mouseX = useMotionValue(0);
  const isMobile = useIsMobile();
  const sizes = isMobile ? MOBILE : DESKTOP;
  const { theme } = useTheme();

  function handleMouseMove(e) {
    mouseX.set(e.clientX);
  }

  function handleMouseLeave() {
    mouseX.set(99999);
  }

  return (
    <div
      ref={dockRef}
      className="dock"
      onMouseMove={isMobile ? undefined : handleMouseMove}
      onMouseLeave={isMobile ? undefined : handleMouseLeave}
    >
      {NAV_ITEMS.map((item) => (
        <DockIcon
          key={item.path}
          item={item}
          dockMouseX={mouseX}
          dockRef={dockRef}
          sizes={sizes}
          theme={theme}
        />
      ))}
    </div>
  );
}
